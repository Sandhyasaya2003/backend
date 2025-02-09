const dns = require("dns");

const resolver = new dns.Resolver();
resolver.setServers(["8.8.8.8", "8.8.4.4"]); // Use Google's public DNS servers

module.exports = resolver;
