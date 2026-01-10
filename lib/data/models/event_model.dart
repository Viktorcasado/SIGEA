class EventModel {
  final String id;
  final String titulo;
  final String? descricao;
  final String? bannerUrl;
  final DateTime dataInicio;
  final DateTime dataFim;
  final String local;
  final int cargaHoraria;

  EventModel({
    required this.id,
    required this.titulo,
    this.descricao,
    this.bannerUrl,
    required this.dataInicio,
    required this.dataFim,
    required this.local,
    this.cargaHoraria = 4,
  });

  factory EventModel.fromJson(Map<String, dynamic> json) {
    return EventModel(
      id: json['id'],
      titulo: json['titulo'],
      descricao: json['descricao'],
      bannerUrl: json['banner_url'],
      dataInicio: DateTime.parse(json['data_inicio']),
      dataFim: DateTime.parse(json['data_fim']),
      local: json['local'],
      cargaHoraria: json['carga_horaria'] ?? 0,
    );
  }
}
