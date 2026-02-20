import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { event_id, user_id, certificate_id } = await req.json()
    console.log(`[generate-certificate] Iniciando geração para Evento: ${event_id}, Usuário: ${user_id}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Buscar Template e Mapeamento
    const { data: template, error: tError } = await supabase
      .from('certificate_templates')
      .select('*')
      .eq('event_id', event_id)
      .single()

    if (tError || !template) throw new Error("Template não encontrado para este evento.")

    // 2. Buscar Dados do Certificado, Usuário e Evento
    const { data: cert, error: cError } = await supabase
      .from('certificados')
      .select('*, profiles(*), events(*)')
      .eq('id', certificate_id)
      .single()

    if (cError || !cert) throw new Error("Dados do certificado não encontrados.")

    // 3. Carregar o Template Base
    const { data: templateFile, error: fError } = await supabase.storage
      .from('certificate-templates')
      .download(template.template_file_path)

    if (fError) throw new Error("Erro ao baixar arquivo do template.")

    const templateBytes = await templateFile.arrayBuffer()
    let pdfDoc;

    if (template.template_type === 'pdf') {
      pdfDoc = await PDFDocument.load(templateBytes)
    } else {
      pdfDoc = await PDFDocument.create()
      const image = template.template_type === 'image' 
        ? await pdfDoc.embedPng(templateBytes) 
        : await pdfDoc.embedJpg(templateBytes)
      
      const page = pdfDoc.addPage([image.width, image.height])
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height })
    }

    const pages = pdfDoc.getPages()
    const firstPage = pages[0]
    const { width, height } = firstPage.getSize()
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // 4. Aplicar Mapeamento
    const mapping = template.mapping.fields
    const dataMap = {
      participant_name: cert.profiles.full_name,
      cpf: cert.profiles.registration_number || '---',
      event_title: cert.events.title,
      workload_hours: `${cert.events.workload || 0} horas`,
      issue_date: new Date(cert.emitido_em).toLocaleDateString('pt-BR'),
      certificate_code: cert.codigo_certificado
    }

    for (const [fieldId, pos] of Object.entries(mapping)) {
      if (fieldId === 'qr_code') {
        // Usando uma API externa para gerar o QR Code como imagem para simplificar o bundle
        const validationUrl = encodeURIComponent(`https://sigea.ifal.edu.br/validar-certificado?codigo=${cert.codigo_certificado}`)
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${validationUrl}`
        
        const qrResp = await fetch(qrUrl)
        const qrBytes = await qrResp.arrayBuffer()
        const qrImage = await pdfDoc.embedPng(qrBytes)
        
        const x = (pos.x / 100) * width
        const y = height - ((pos.y / 100) * height)
        const size = pos.size || 80

        firstPage.drawImage(qrImage, {
          x: x - (size / 2),
          y: y - (size / 2),
          width: size,
          height: size
        })
      } else if (dataMap[fieldId]) {
        const text = dataMap[fieldId]
        const x = (pos.x / 100) * width
        const y = height - ((pos.y / 100) * height)
        const fontSize = pos.fontSize || 14

        firstPage.drawText(text, {
          x: x - (font.widthOfTextAtSize(text, fontSize) / 2),
          y: y - (fontSize / 2),
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0)
        })
      }
    }

    // 5. Salvar e Upload do PDF Final
    const pdfBytes = await pdfDoc.save()
    const finalPath = `issued/${event_id}/${user_id}/${cert.codigo_certificado}.pdf`
    
    const { error: uError } = await supabase.storage
      .from('certificates-pdf')
      .upload(finalPath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uError) throw uError

    // 6. Atualizar registro no banco
    await supabase
      .from('certificados')
      .update({ url_pdf: finalPath })
      .eq('id', certificate_id)

    return new Response(JSON.stringify({ success: true, path: finalPath }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error("[generate-certificate] Erro:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})