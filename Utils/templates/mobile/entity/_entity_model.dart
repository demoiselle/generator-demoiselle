class <%= name.capital %>Model {
<%_ (properties || []).forEach(function(prop) { _%>
  final <%= dartType(prop.type) %><%= prop.isReadOnly ? '?' : '' %> <%= prop.name %>;
<%_ }); _%>

  const <%= name.capital %>Model({
<%_ (properties || []).forEach(function(prop) { _%>
<%_ if (prop.isReadOnly) { _%>
    this.<%= prop.name %>,
<%_ } else { _%>
    required this.<%= prop.name %>,
<%_ } _%>
<%_ }); _%>
  });

  factory <%= name.capital %>Model.fromJson(Map<String, dynamic> json) {
    return <%= name.capital %>Model(
<%_ (properties || []).forEach(function(prop) { _%>
<%_ if (/^(date|localdate|localdatetime)$/i.test(prop.type)) { _%>
      <%= prop.name %>: json['<%= prop.name %>'] != null ? DateTime.parse(json['<%= prop.name %>'] as String) : <%= prop.isReadOnly ? 'null' : 'DateTime.now()' %>,
<%_ } else if (/^(integer|int|long|short)$/i.test(prop.type)) { _%>
      <%= prop.name %>: json['<%= prop.name %>'] as int<%= prop.isReadOnly ? '?' : '? ?? 0' %>,
<%_ } else if (/^(double|float|bigdecimal|number)$/i.test(prop.type)) { _%>
      <%= prop.name %>: (json['<%= prop.name %>'] as num?)<%= prop.isReadOnly ? '?.toDouble()' : '?.toDouble() ?? 0.0' %>,
<%_ } else if (/^boolean$/i.test(prop.type)) { _%>
      <%= prop.name %>: json['<%= prop.name %>'] as bool<%= prop.isReadOnly ? '?' : '? ?? false' %>,
<%_ } else if (isPrimitive(prop)) { _%>
      <%= prop.name %>: json['<%= prop.name %>'] as <%= dartType(prop.type) %><%= prop.isReadOnly ? '?' : "? ?? ''" %>,
<%_ } else { _%>
      <%= prop.name %>: json['<%= prop.name %>'] as <%= dartType(prop.type) %><%= prop.isReadOnly ? '?' : "? ?? ''" %>,
<%_ } _%>
<%_ }); _%>
    );
  }

  Map<String, dynamic> toJson() {
    return {
<%_ (properties || []).forEach(function(prop) { _%>
<%_ if (/^(date|localdate|localdatetime)$/i.test(prop.type)) { _%>
      '<%= prop.name %>': <%= prop.name %><%= prop.isReadOnly ? '?' : '' %>.toIso8601String(),
<%_ } else { _%>
      '<%= prop.name %>': <%= prop.name %>,
<%_ } _%>
<%_ }); _%>
    };
  }

  <%= name.capital %>Model copyWith({
<%_ (properties || []).forEach(function(prop) { _%>
    <%= dartType(prop.type) %>? <%= prop.name %>,
<%_ }); _%>
  }) {
    return <%= name.capital %>Model(
<%_ (properties || []).forEach(function(prop) { _%>
      <%= prop.name %>: <%= prop.name %> ?? this.<%= prop.name %>,
<%_ }); _%>
    );
  }
}
