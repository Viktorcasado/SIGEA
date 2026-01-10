
export const INSTITUTION_CONTACTS: Record<string, { email: string; phone: string; dept: string; coords?: string }> = {
  "IFAL - Campus Maceió": { 
    email: "coordenacao.maceio@ifal.edu.br", 
    phone: "(82) 2126-7000", 
    dept: "Coordenação de Eventos",
    coords: "-9.6644,-35.7314"
  },
  "IFAL - Campus Arapiraca": { 
    email: "direcao.arapiraca@ifal.edu.br", 
    phone: "(82) 2126-6200", 
    dept: "Departamento de Extensão",
    coords: "-9.7615,-36.6575"
  },
  "IFAL - Campus Palmeira dos Índios": { 
    email: "extensao.palmeira@ifal.edu.br", 
    phone: "(82) 2126-6300", 
    dept: "Setor Acadêmico",
    coords: "-9.4019,-36.6267"
  },
  "IFAL - Campus Satuba": { 
    email: "ensino.satuba@ifal.edu.br", 
    phone: "(82) 2126-6400", 
    dept: "Coordenação Pedagógica",
    coords: "-9.5614,-35.8239"
  },
  "IFAL - Campus Marechal Deodoro": { 
    email: "eventos.marechal@ifal.edu.br", 
    phone: "(82) 2126-6500", 
    dept: "Secretaria de Cursos",
    coords: "-9.7042,-35.8943"
  },
  "IFAL - Campus Penedo": { 
    email: "apoio.penedo@ifal.edu.br", 
    phone: "(82) 2126-6600", 
    dept: "Coordenação Geral",
    coords: "-10.2925,-36.3214"
  },
  "IFAL - Campus Murici": { 
    email: "murici@ifal.edu.br", 
    phone: "(82) 2126-6700", 
    dept: "Direção de Ensino",
    coords: "-9.3056,-35.9403"
  },
  "IFAL - Campus Santana do Ipanema": { 
    email: "santana@ifal.edu.br", 
    phone: "(82) 2126-6800", 
    dept: "Setor de Eventos",
    coords: "-9.3667,-37.2417"
  },
  "IFAL - Campus Coruripe": { 
    email: "coruripe@ifal.edu.br", 
    phone: "(82) 2126-6900", 
    dept: "Coordenadoria",
    coords: "-10.1258,-36.1758"
  },
  "IFAL - Campus Viçosa": { 
    email: "vicosa@ifal.edu.br", 
    phone: "(82) 2126-7100", 
    dept: "Núcleo de Extensão",
    coords: "-9.3739,-36.2425"
  },
  "IFAL - Campus São Miguel dos Campos": { 
    email: "saomiguel@ifal.edu.br", 
    phone: "(82) 2126-7200", 
    dept: "Secretaria Acadêmica",
    coords: "-9.7797,-36.0894"
  },
  "IFAL - Campus Rio Largo": { 
    email: "riolargo@ifal.edu.br", 
    phone: "(82) 2126-7300", 
    dept: "Apoio ao Estudante",
    coords: "-9.4825,-35.8458"
  },
  "IFAL - Campus Maragogi": { 
    email: "maragogi@ifal.edu.br", 
    phone: "(82) 2126-7400", 
    dept: "Eventos",
    coords: "-9.0122,-35.2225"
  },
  "IFAL - Campus Batalha": { 
    email: "batalha@ifal.edu.br", 
    phone: "(82) 2126-7500", 
    dept: "Ensino e Pesquisa",
    coords: "-9.6781,-37.1247"
  },
  "IFAL - Campus Benedito Bentes": { 
    email: "benedito.bentes@ifal.edu.br", 
    phone: "(82) 2126-7600", 
    dept: "Coordenação de Extensão",
    coords: "-9.5539,-35.7011"
  }
};

export const CAMPUS_LIST = Object.keys(INSTITUTION_CONTACTS);
