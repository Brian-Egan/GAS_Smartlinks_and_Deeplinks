function l(txt) {
// log(txt);
  Logger.log(txt);
}

function net_abbrvs(full_net_name) {
//  var hsh = rangeToHash(VARIABLES_SHEET.getRange("B11:C20"))
  var hsh = rangeToHash(getRangeNamed("networks_by_name"), true, false);
  return hsh[full_net_name];
}


 

function extractJSONFromNewSite(url) {
  url = url || "https://www.velocity.com/tv-shows/iron-resurrection/";
  var response = UrlFetchApp.fetch(url, {muteHttpExceptions: true});
  var xml = response.getContentText();
  var reactH = "window.__reactTransmitPacket = ";
  Logger.log("sent to script Log");
  var vi = xml.slice((reactH.length + xml.indexOf(reactH)), xml.length);
  if (vi.indexOf("\nwindow") <= 0) {
    endChar = (vi.indexOf(";</script>"));
  }  else {
    endChar = (vi.indexOf("\nwindow") - 1);
  }
  var vi = vi.slice(0, endChar);
  var js = JSON.parse(vi); // TLC Big & Little returning empty JSON error
  return js;
}

function getInfoFromGoSite(url) {
  url = url || "https://www.animalplanetgo.com/dr-jeff-rocky-mountain-vet/last-hope/";
  var response = UrlFetchApp.fetch(url, {muteHttpExceptions: true});
  var doc = Xml.parse(response, true);
  var bodyXml = doc.html.body[1].toXmlString();
  var document = XmlService.parse(bodyXml);
  var root = document.getRootElement();
  var res = {};
  if (getElementsByClassName(root, 'video-player-container').length > 0) {
    var json = JSON.parse(getElementsByClassName(root,'video-player-container')[0].getAttribute("data-video").getValue());
    res.type = json.type;
    res.id = json.id;
    res.name = json.name;
    res.show_name = json.show.name;
  } else if (getElementsByClassName(root, 'show-page-module').length > 0){
    var div = getElementsByClassName(root, 'show-page-module')[0];
    if ((div.getAttribute("data-curated-list")) && (div.getAttribute("data-curated-list").getValue() == "true")) {
//      res.type = "Curated List";
      res.type = "curated_list";
    } else {
      res.type = div.getAttribute("data-show-type").getValue();
    }
    res.id = div.getAttribute("data-show-id").getValue();
    res.show_name = div.getAttribute("data-show-name").getValue();
  }
  return res;
//  return [res.show_name, res.name, res.type,res.id];
}


function getID(url) {
 if (url.indexOf("go.com") > 0) {
    res = getInfoFromGoSite(url);
  } else {
    res = getVideoInfoNewSites(url);
  }
  return res.id;  
}

function formatArray(urlRange) {
 var arr = [];
 if (typeof(urlRange) != "string") {
    for (row in urlRange) {
      if (urlRange[row].length > 1) {
        for (str in urlRange[row]) {
          strn = urlRange[row][str].trim();
          arr.push(strn);
        }
      } else {
        strn = urlRange[row][0].trim();
        arr.push(strn);
      }
    }
  } else {
    if (urlRange.indexOf(",") >= 0) {
      urlArr = urlRange.split(",");
      for (row in urlArr) {
        strn = urlArr[row].trim();
        arr.push(strn);
      }
    } else {
      arr.push(urlRange.trim());
    }
  }
  return arr; 
  
}


function getIDs(urlRange) {
  // URLs should be in column 0 (index) of range
  var ret = [];
  var urlArr = formatArray(urlRange);
  for (str in urlArr) {
    ret.push(getID(urlArr[str]));
  }
  return ret;
}

function getPropertiesForSmartlink(url) {
  if (url.indexOf("go.com") > 0) {
    res = getInfoFromGoSite(url);
  } else {
//    return "New sites: " + url;
    res = getVideoInfoNewSites(url);
  }
  return res;
// return [res.show_name, res.name, res.type,res.id];
}

//join(",",{join(":",{C$26,C27}),join(":",{D$26,D27}),join(":",{E$26,E27})})

function addVariableParameters(content_object, link_category) {
  var str = "";
  str += ("cp_1=" + content_object.type.replace(" ","_"));
  var name = getContentObjectName(content_object, false);
//  str += ("&cp_8=" + name.toLowerCase().replace(/ /g,"_").replace(/[|'", %=?!$():.]/g,""));
  str += ("&cp_8=" + stringToSlug(name));
  if (link_category == "email") {
    str += ("&cp_9=" + stringToSlug(name));
//    str += ("&cp_9=" + name.toLowerCase().replace(/ /g,"_").replace(/[|'", %=?!$():.]/g,""));
  }
  return str;
}

function getContentObjectName(content_object, include_parent) {
  include_parent = include_parent || false;
  if (content_object.name.length > 0) {
    if ((content_object.show_name.length > 0) && (include_parent == true)) {
      return (content_object.show_name + ": " + content_object.name);
    } else {
      return content_object.name;
    }
  } else {
    return content_object.show_name;
  }
}

/// home, about, download, shows, base


function buildSmartlinkCustomParams(url, link_category, parameters, return_keys) {
//  parameters = parameters || SpreadsheetApp.getActiveSpreadsheet().getSheetByName("[TEMP] New Smartlink Generator").getRange("L1").getValue();
  var parameters = parameters || "";
  var return_array = return_array || undefined;
  url = url || "https://www.tlc.com/tv-shows/90-day-fiance"
  link_category = link_category || "social"
  if (link_category != "email") {
     link_category = "social";
    // This puts the burden on creating email links to get it right. Less area for mistakes for the social team.
  }
  var params = {}
  if (parameters.length > 0) {
    for (i in parameters.split(",")) {
      kv = parameters.split(",")[i].split(":");
      params[kv[0].trim()] = kv[1].trim();
    }
  }
  for (k in params) {
   var v = params[i];
  }
  var network = netFromUrl(url);
  Logger.log("Will send net " + network);
  var content_object = getPropertiesForSmartlink(url);
  var base = getSmartlinkBase(network, content_object.type, link_category);
  var resp = (
    base + "?"
    + "passthrough_url=" + url
    + "&" + content_object.type + "_id=" + res.id
  )
  resp += ("&" + addVariableParameters(content_object, link_category));
  delete(params.cp_1);
  
  for (k in params) {
    v = params[k];
    if (v.length > 0) {
      resp += ("&" + k + "=" + v);
    } else {
      // To handle blank parameters
      resp += ("&" + k + "=");
    }
  }
  if (return_keys == undefined) {
    return resp;
  } else {
//    return "word";
    var ret_array = [];
    var arr = return_keys.split(",");
    for (i in arr) {
      if (arr[i].toLowerCase() == "name") {
          ret_array.push(getContentObjectName(content_object, true));
      } else if (arr[i].toLowerCase() == "link") {
         ret_array.push(resp);
      } else if (arr[i].toLowerCase() == "id") {
         ret_array.push(content_object.id);
      } else if (arr[i].toLowerCase() == "type") {
         ret_array.push(content_object.type);
      } else if (arr[i].toLowerCase() == "network") {
         ret_array.push(network);
      }
      }
    return [ret_array];
  }
}

function listShowAndSmartlink(network, campaign, medium, date, urlRange) {
  var arr = formatArray(urlRange);
  var ret = [];
  for (i in arr) {
    content_object = getPropertiesForSmartlink(arr[i]);
    ret.push([content_object.show_name, buildSmartlink(network, arr[i], medium, campaign, date, content_object)]);
  }
  return ret;
}

function buildSmartlinks(network, medium, campaign, date, urlRange) {
  var arr = formatArray(urlRange);
  var ret = [];
  var medium = medium || "";
  var campaign = campaign || "";
  var date = date || "";
  for (i in arr) {
    ret.push(buildSmartlink(network, arr[i], medium, campaign, date));
  }
  return ret;
}    

function buildSmartlink(network, url, medium, campaign, date, content_object) {
  network = network || "Animal Planet"
  if (network.length > 3) {
    var network = net_abbrvs(network);
  }
  var content_object = content_object || getPropertiesForSmartlink(url);
  var base = getSmartlinkBase(network, content_object.type);
  
  return (
    base + "?"
    + "passthrough_url=" + url
    + "&" + content_object.type + "_id=" + res.id
    + "&cp_0=" + medium 
    + "&cp_1=" + content_object.type 
    + "&cp_2=" + campaign 
    + "&cp_3=" + date
  )
}

function getSmartlinkBase(network, type, link_category) {
  type = type || "show"
  Logger.log("received network " + network);
  network = network || "APL"
  Logger.log("Network is still " + network);
  link_category = link_category || "email"
  if (link_category == "email") {
    var rng = getRangeNamed("email_smartlink_bases");
    var key_column = rng[0].indexOf(type);
  } else {
    var rng = getRangeNamed("social_smartlink_bases");
    var key_column = rng[0].indexOf(type);
    Logger.log(rng.filter(function(x) { return x[0] == network}));
  }
  return rng.filter(function(x) { return x[0] == network})[0][key_column];
}


function getProperty(url, prop) {
  if (url.indexOf("go.com") > 0) {
    res = getInfoFromGoSite(url);
  } else {
    res = getVideoInfoNewSites(url);
  }
  if (res[prop.toLowerCase()] == undefined) {
    return ("Propery not found - available properties: [" + Object.keys(res).join(", ") + "]");
  } else {
    return res[prop.toLowerCase()];
  }
}

function brockOhurn(url) {
  if (url.indexOf("go.com") > 0) {
    res = getInfoFromGoSite(url);
  } else {
    res = getVideoInfoNewSites(url);
  }
//  return res;
 return [res.show_name, res.name, res.type,res.id];
}

function brockohurn(url) {
  var url = url || "https://www.tlc.com/tv-shows/little-couple/";
  return brockOhurn(url);
}


function randi(url) {
 return brockOhurn(url);
}


function getKeyByName(str, hsh) {
  return hsh[Object.keys(hsh).filter(function(x) { return x.indexOf(str)  !== -1})[0]];
}

function getVideoInfoNewSites(url, respWith) {
  // Response key options are name, id, type, show, probably more.
//  var respKeys = respWith.split(",").map(function(x) { return x.toLowerCase()}); // This is if we want to send it keys.
  url = url || "https://www.discovery.com/tv-shows/coopers-treasure/";
  var json = extractJSONFromNewSite(url);
  if (url.indexOf("full-episodes") >= 0) {
    var vid = getKeyByName("video-4",json.videoPlayer.players).video
    var resp = {"show_name": vid.show.name, "name": vid.name, "type": vid.type, "id": vid.id}
  } else if (url.indexOf("tv-shows") >= 0) {
    if (json.layout.contentBlocks != undefined) {
      var vid = json.layout.contentBlocks[0].content.show
    } else if (json.header.showHeader != undefined) {
       var vid = json.header.showHeader.items[0];
    } else if (getKeyByName("/tv-shows/",json.layout) != undefined) {
      var s = getKeyByName("/tv-shows/",json.layout);
      hsh = getKeyByName("/tv-shows/",json.layout);
      if (hsh.contentBlocks[0].content.show == undefined) {
        // The newer sites with new short form player are set up differently. We have to look for the 'headerLiveNow' component.
        var vid = json.header.contentBlocks.filter(function(c) { return c.component == "HeaderLiveNow"})[0].headerLiveNow.show;
      } else {
        var vid = hsh.contentBlocks[0].content.show;
      }
    }
    var respArr = {"show_name": vid.name, "name": "", "type": "show", "id": vid.id}
    var resp = {"show_name": vid.name, "name": "", "type": "show", "id": vid.id}
  } else if (url.indexOf("playlists") >= 0) {
    var vid = json.playlist.curatedlist;
    var respArr = [vid.name,"","curated list",vid.id];
    var resp = {"show_name": vid.name, "name": "", "type": "curated_list", "id": vid.id}
  }

//  This is helpful if we're sending keys.
//  var respArr = [];
//  for (i in respKeys) {
//   key = respKeys[i];
//    key == "show" ? respArr.push(vid[key].name) : respArr.push(vid[key]);
////   respArr.push(vid[key]); 
//  }
  
//  slog(resp);
  Logger.log(resp);
  return resp;
  
}


function getSeasonNewSite() {
  var ui = SpreadsheetApp.getUi();
  ui.alert("Coming Soon!");
//  var url = ui.prompt("What is the URL?").getResponseText();
//  var seasonNum = ui.prompt("What season number? (enter only the number)").getResponseText();
////  var url = "https://www.tlc.com/tv-shows/my-big-fat-fabulous-life/";
////  var seasonNum = "4";  
//  var json = extractJSONFromSite(url);
//  var b = json.layout["eos-show-layout"].contentBlocks.filter(function(x) {return x.displayType == "EpisodeList"});
//  seasons = b[0].content.items[0].seasons;
//  s = seasons.filter(function(c) { return c.number == parseInt(seasonNum)});
//  SpreadsheetApp.getActiveSheet().appendRow([s[0].number, s[0].id]);
  // It needs to overwrite all the stuff in B2:B5... 
  
  
}
