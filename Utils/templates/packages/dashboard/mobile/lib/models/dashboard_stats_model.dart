class DashboardStatsModel {
  final Map<String, int> counts;

  const DashboardStatsModel({
    this.counts = const {},
  });

  factory DashboardStatsModel.fromJson(Map<String, dynamic> json) {
    final countsJson = json['counts'] as Map<String, dynamic>?;
    return DashboardStatsModel(
      counts: countsJson != null
          ? countsJson.map((key, value) => MapEntry(key, value as int))
          : const {},
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'counts': counts,
    };
  }
}
