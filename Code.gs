SS = SpreadsheetApp.getActiveSpreadsheet();
VARIABLES_SHEET = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("variables");

function rangeToHash(rng, isArray, toSlug) {
  rng = rng || SpreadsheetApp.getActiveSpreadsheet().getSheetByName("variables").getRange("B11:C20");
//  rng = rng || getRangeNamed("deeplink_paths");
  isArray = isArray || false;
  toSlug = toSlug || false;
  if (isArray == true) {
    var vals = rng;
  } else {
    var vals = rng.getValues();
  }
  var hsh = {};
  if (vals[0].length > 2) {
//    Logger.log("multilevel " + vals[0].length);
    Logger.log(vals);
    // This means it's a multilevel hash.
    var headers = ((toSlug == true) ? vals[0].map(function(c) { return stringToSlug(c)}) : vals[0]);
    for (i in vals) {
      if (i > 0) {
//        log("ROW: " + i);
        row = vals[i];
//        var key = row[0];
        var key = ((toSlug == true) ? stringToSlug(row[0]) : row[0]);
        hsh[key] = (hsh[key] || {});
        for (c in row) {
          cell = row[c];
          
//          log("   COLUMN: " + c + "[" + headers[c] + "]  is  " + cell);
          if (c > 0) {
            hsh[key][headers[c]] = cell;
          }
        }
      }
    }       
  } else {
//    Logger.log("Single level");
    for (i in vals) {
      Logger.log("Val: " + i);
      var row = vals[i];
      hsh[row[0].trim()] = row[1].trim();
    }
  }
//  Logger.log("resp:\n" + hsh);
  return hsh;
}

function log(txt) {
  Logger.log(txt);
}



function getRangeNamed(name) {
  var name = name || "networks_by_name"
  var rng = SS.getNamedRanges().filter(function(x) { return x.getName().toLowerCase() == name.toLowerCase()})[0];
  if (rng != undefined) {
    return rng.getRange().getValues();
  } else {
    return [];
  }                                    
}

function hashlookup(range, key, subkey) {
  // keys must be in first row of range/2d array;
  if (range == "Range") {
    var hsh = rangeToHash(range);
  } else {
    var hsh = rangeToHash(range, true);
  }
  var resp = hsh[key];
  if (subkey != undefined) {
    if (resp[subkey] == undefined) {
//      return "undefined";
      return resp;
    } else {
      return resp[subkey];
    }
  } else {
    return resp;
  }  
}


function getUrlBase(url) {
  url = url || "https://www.tlc.com/tv-shows/90-day-fiance"
  var base = url.split(".com")[0].split("://")[1];
  if (base.indexOf("www") > -1) {
    var base = base.split(".")[1];
  }
  return base;
}

function netFromUrl(url) {
  var base = getUrlBase(url);
  var hsh = rangeToHash(VARIABLES_SHEET.getRange("A23:B31"));
  var network = hsh[base.toLowerCase()];
//  Logger.log("network is " + network);
  return network;
}

function stringToSlug(str) {
  return str.toLowerCase().replace(/ /g,"_").replace(/[|'", %=?!$():.]/g,"");
}

function encode(value) {
  return encodeURIComponent(value);
}

function decode(value) {
  return decodeURIComponent(value);
}


function hashlookup(range, key, subkey) {
  // keys must be in first row of range/2d array;
  if (range == "Range") {
    var hsh = rangeToHash(range);
  } else {
    var hsh = rangeToHash(range, true);
  }
  var resp = hsh[key];
  if (subkey != undefined) {
    if (resp[subkey] == undefined) {
//      return "undefined";
      return resp;
    } else {
      return resp[subkey];
    }
  } else {
    return resp;
  }  
}

