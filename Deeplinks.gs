function getDeeplinks(net,type,id,platforms) {
  platforms = platforms || "ios";
  platforms = platforms.split(",");
  net = net || "apl";
  net = ((net.length > 3) ? net_abbrvs(net) : net);
  net = stringToSlug(net);
  type = type || "show";
  id = id || "12345678";
  var base = rangeToHash(getRangeNamed("network_deeplink_schemes"), true, true)[net];
  Logger.log(base);
  var paths = rangeToHash(getRangeNamed("deeplink_paths"),true,false);
//  response = ((platforms.length > 1) ? [] : "");
  var response = [] 
  if (type.toLowerCase() != "season") {
    var path = paths[type];
    Logger.log(path);
    for (i in platforms) {
      response.push(base[platforms[i]] + path + id);
    }
    response = ((platforms.length > 1) ? [response] : response);
  } else {
    response = "Season is not yet supported";
  }
  Logger.log(response); 
  return response;
}