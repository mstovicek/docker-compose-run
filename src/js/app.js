Zepto(function($){
    $("#button").on('click', function (e) {
        setRunContent(
            toRun(
                fromYaml(
                    getComposeContent()
                )
            )
        );
    });
});

function getComposeContent() {
    return $("#compose").val();
}

function setRunContent(content) {
    return $("#run").val(content);
}

function fromYaml(yaml) {
    return jsyaml.load(yaml);
}

function toRun(doc) {
    var run = ""
    for (var serviceName in doc.services) {
        run += toSingleRun(serviceName, doc.services[serviceName]) + "\n\n"
    }
    return run;
}

function toSingleRun(serviceName, service) {
    var indent = "  ";
    var lineSuffix = " \\\n";

    var run = "docker run -d" + " \\\n"
        + indent + "--name " + serviceName + lineSuffix
        + getPorts(indent + "--publish ", service, lineSuffix)
        + getNetwork(indent + "--network ", service, lineSuffix)
        + getNetworkAliases(indent + "--network-alias ", service, lineSuffix)
        + getEnvironment(indent + "--env ", service, lineSuffix)
        + getVolumes(indent + "--volume ", service, lineSuffix)
        + getWorkdir(indent + "--workdir ", service, lineSuffix)
        + getImage(indent, service, "");

    if (typeof service.command != "undefined") {
        run += getCommand(" \\\n" + indent, service, "");
    }
    return run;
}

function getPorts(prefix, service, lineSuffix) {
    var result = "";
    for (var env in service.ports) {
        result += prefix + service.ports[env] + lineSuffix
    }
    return result;
}

function getEnvironment(prefix, service, lineSuffix) {
    var result = "";
    for (var env in service.environment) {
        if (isNumeric(env)) {
            result += prefix + service.environment[env] + lineSuffix
        } else {
            result += prefix + env + "=" + service.environment[env] + lineSuffix
        }
    }
    return result;
}

function getNetworkRaw(service) {
    if (typeof service.networks == "undefined") {
        return "";
    }
    return Object.keys(service.networks)[0];
}

function getNetwork(prefix, service, lineSuffix) {
    var network = getNetworkRaw(service);
    if (network == "") {
        return network;
    }
    return prefix + network + lineSuffix;
}

function getNetworkAliases(prefix, service, lineSuffix) {
    var network = getNetworkRaw(service);

    if (network == "") {
        return "";
    }

    var result = "";
    aliases = service.networks[getNetworkRaw(service)].aliases
    for (var alias in aliases) {
        result += prefix + aliases[alias] + lineSuffix;
    }
    return result;
}

function getWorkdir(prefix, service, lineSuffix) {
    if (typeof service.working_dir == "undefined") {
        return "";
    }
    return prefix + service.working_dir + lineSuffix;
}

function getVolumes(prefix, service, lineSuffix) {
    var result = "";
    for (var vol in service.volumes) {
        result += prefix + service.volumes[vol] + lineSuffix
    }
    return result;
}

function getImage(prefix, service, lineSuffix) {
    return prefix + service.image + lineSuffix;
}

function getCommand(prefix, service, lineSuffix) {
    return prefix + service.command + lineSuffix;
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
