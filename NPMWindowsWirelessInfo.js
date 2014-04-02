module.exports = new function NPMWindowsWirelessInfo () {
	this.helperName = "/depend/WirelessNetView/WirelessNetView.exe";
	this.helperOutputFile = '"/depend/WirelessNetView/tempOutput.txt"';
	this.exec = require("child_process").exec;
	this.fs = require("fs");
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
		return "/sort " + sort.join("/");
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
			Sort:	Can be false, empty string, or an empty array to not sort,
					a number (zero indexed) specifying the collumn to sort
					with, the name of the collumn to sort with or an array of
					numbers and names to sort using multiple collumns. Add a ~
					in front to sort in descending order. If true uses last
					value from GUI.
		Returns:		Nothing
		Description:	Put output of helper in file.
		CallbackParams:	execError, stdout, stderr
*/

NPMWindowsWirelessInfo.prototype.writeOutputFile = function (file, type, sort) {
	file = file || this.helperOutputFile;
	type = type ? "/" + type : "/stext";
	sort = this.normalizeSort(sort);
	this.executeHelper(type + " " + file + " " + sort, function (execError, stdout, stderr) {
		callback(execError, stdout, stderr);
	}.bind(this));
};

/*
	getRawOutput:
		Parameters:		type[String], sort[Boolean, String, Number, Array],
						callback[Function], file[String]
			Types: 	"stext"[Default], "stab", "scomma", "stabular", "shtml",
					"sverhtml", "sxml"
			Sort:	Can be false, empty string, or an empty array to not sort,
					a number (zero indexed) specifying the collumn to sort
					with, the name of the collumn to sort with or an array of
					numbers and names to sort using multiple collumns. Add a ~
					in front to sort in descending order. If true uses last
					value from GUI.
			File:	Filename[String], the location + filename of the
					intermediate file, default=this.helperOutputFile
		Returns:		Nothing
		Description:	Put output of helper in standard file and return raw
						content to callback function.
		CallbackParams:	execError, stdout, stderr, fileError, rawOutput
*/

NPMWindowsWirelessInfo.prototype.getRawOutput = function (type, sort, callback, file) {
	this.writeOutputFile(file, type, sort, function (execError, stdout, stderr) {
		this.fs.readFile(this.helperOutputFile, "utf8", function (fileError, rawOutput) {
			callback(execError, stdout, stderr, fileError, rawOutput);
		});
	});
};