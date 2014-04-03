function NPMWindowsWirelessInfo () {
	this.helperName = __dirname + "\\depend\\WirelessNetView\\WirelessNetView.exe";
	this.helperOutputFile = __dirname + "\\depend\\WirelessNetView\\tempOutput.txt";
	this.exec = require("child_process").exec;
	this.fs = require("fs");
	
	this.networkPropertyList = ["SSID", "lastSignal", "averageSignal", "detectionCounter", "procentDetection", "securityEnabled", "connectable", "authentication", "cipher", "PHYTypes", "firstDetectedOn", "lastDetectedOn", "MACAddress", "RSSI", "channelFrequency(GHz)", "channelNumber", "companyName", "maximumSpeed", "BSSType", "connected"];
};

/*
	Network:
		Constructor:
			Parameters:
				rawCommaSeperatedPropertyList[String]
		Description: The network base structure
*/

NPMWindowsWirelessInfo.prototype.Network = function (rawCommaSeperatedPropertyList, propertyList) {
	var valueList = rawCommaSeperatedPropertyList.split(",");
	for (var k = 0; k < propertyList.length; k++) {
		this[propertyList[k]] = valueList[k];
	}
};

/*
	executeHelper:
		Parameters:		execParams[String], callback[Function]
		Returns:		rawOutput[String]
		Description:	Execute the helper with given parameters.
		CallbackParams:	execError, stdout, stderr
*/

NPMWindowsWirelessInfo.prototype.executeHelper = function (execParams, callback) {
	this.exec(this.helperName + " " + execParams, callback || function () {});
};

/*
	normalizeSort:
		Parameters:		sort[Boolean, String, Number, Array]
			Sort:	Can be false, empty string, or an empty array to not sort,
					a number (zero indexed) specifying the collumn to sort
					with, the name of the collumn to sort with or an array of
					numbers and names to sort using multiple collumns. Add a ~
					in front to sort in descending order. If true uses last
					value from GUI.
		Returns: 		sort[String]
		Description: 	Returns the sortcommand for the helper
*/

NPMWindowsWirelessInfo.prototype.normalizeSort = function (sort) {
	if (sort === false || sort === " " || sort.length === 0) {
		return "/nosort";
	}
	if (typeof sort === "string" || typeof sort === "number") {
		return "/sort " + sort;
	}
	if (sort.join) {
		return "/sort " + sort.join("/sort ");
	}
	return "";
};

/*
	writeOutputFile
		Parameters:		file[String], type[String],
						sort[Boolean, String, Number, Array],
						callback[Function]
			File:	Filename[String]; Default=this.helperOutputFile
			Types: 	"stext"[Default], "stab", "scomma", "stabular", "shtml",
					"sverhtml", "sxml"
			Sort:	See normalizeSort
		Returns:		This
		Description:	Put output of helper in file.
		CallbackParams:	execError, stdout, stderr
*/

NPMWindowsWirelessInfo.prototype.writeOutputFile = function (file, type, sort, callback) {
	file = file || this.helperOutputFile;
	type = type ? "/" + type : "/stext";
	sort = this.normalizeSort(sort);
	this.executeHelper(type + " " + file + " " + sort, function (execError, stdout, stderr) {
		callback(execError, stdout, stderr);
	}.bind(this));
	return this;
};

/*
	getRawOutput:
		Parameters:		type[String], sort[Boolean, String, Number, Array],
						callback[Function], file[String]
			Types: 	"stext"[Default], "stab", "scomma", "stabular", "shtml",
					"sverhtml", "sxml"
			Sort:	See normalizeSort
			File:	Filename[String], the location + filename of the
					intermediate file, default=this.helperOutputFile
		Returns:		this
		Description:	Put output of helper in standard file and return raw
						content to callback function.
		CallbackParams:	execError, stdout, stderr, fileError, rawOutput
*/

NPMWindowsWirelessInfo.prototype.getRawOutput = function (type, sort, callback, file) {
	this.writeOutputFile(file, type, sort, function (execError, stdout, stderr) {
		this.fs.readFile(this.helperOutputFile, "utf8", function (fileError, rawOutput) {
			callback(execError, stdout, stderr, fileError, rawOutput);
		});
	}.bind(this));
	return this;
};

/*
	getNetworks
		Parameters:		callback[Function]
		Returns:		this
		Description:	Get information about the currently available networks.
		CallbackParams:	networks[Array]
			Networks[Array]: Array of Network Objects (see documentation)
*/

NPMWindowsWirelessInfo.prototype.getNetworks = function (callback) {
	if (!callback) {
		throw "No callback provided";
		return this;
	}
	this.getRawOutput("scomma", false, function (execError, stdout, stderr, fileError, rawOutput) {
		if (execError || stderr || fileError) {
			callback("There was an error when trying to get information about the available networks: " + (execError || stderr || fileError));
			return;
		}
		
		var lines = rawOutput.split(/\r\n|\r|\n/),
			networks = [];
		lines.pop(); //BUG IN OUTPUT FILE OF HELPER: TRAILING NEWLINE
		for (var netKey = 0; netKey < lines.length; netKey++) {
			networks.push(new this.Network(lines[netKey], this.networkPropertyList));
		}
		
		callback(null, networks);
	}.bind(this));
	return this;
};

module.exports = new NPMWindowsWirelessInfo();