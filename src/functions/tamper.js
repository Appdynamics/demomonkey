export default function(node, configuration, key = "value") {
    configuration.forEach(function(pattern) {
        node[key] = pattern.apply(node[key])
    });
}
