export default function(node, configuration, key = "value") {
    configuration.forEach(function(pattern) {
        node[key] = node[key].replace(pattern[0], pattern[1]);
    });
}
