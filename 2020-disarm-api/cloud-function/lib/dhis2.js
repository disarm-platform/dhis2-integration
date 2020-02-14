"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_fetch_1 = __importDefault(require("node-fetch"));
var write_debug_file_1 = require("./write_debug_file");
var config_1 = __importDefault(require("./config"));
function get_data_from_dhis2() {
    return __awaiter(this, void 0, void 0, function () {
        var metadata, dataSetId, orgUnitIds, orgUnitParams, dataValueSets, rawOrgUnits, rawDataElements, orgUnitsFeatures, dataElementLookup;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, get_metadata()];
                case 1:
                    metadata = _a.sent();
                    dataSetId = metadata.dataSets[0].id;
                    orgUnitIds = metadata.organisationUnits
                        .filter(function (i) { return i.hasOwnProperty('parent'); })
                        .map(function (i) { return i.id; });
                    orgUnitParams = orgUnitIds.map(function (i) { return "&orgUnit=" + i; }).join('');
                    return [4 /*yield*/, get_dataValueSets(dataSetId, orgUnitParams)];
                case 2:
                    dataValueSets = _a.sent();
                    rawOrgUnits = metadata.organisationUnits;
                    return [4 /*yield*/, write_debug_file_1.write_debug_file(rawOrgUnits, 'rawOrgUnits')];
                case 3:
                    _a.sent();
                    rawDataElements = metadata.dataElements;
                    return [4 /*yield*/, write_debug_file_1.write_debug_file(rawDataElements, 'rawDataElements')];
                case 4:
                    _a.sent();
                    orgUnitsFeatures = rawOrgUnits.filter(function (i) { return i.hasOwnProperty('parent'); }).map(function (i) {
                        return {
                            type: 'Feature',
                            properties: {
                                id: i.id,
                                orgUnit_id: i.id,
                                orgUnit_name: i.name,
                            },
                            geometry: {
                                type: 'Point',
                                coordinates: i.geometry.coordinates,
                            }
                        };
                    });
                    dataElementLookup = rawDataElements
                        .reduce(function (acc, i) {
                        acc[i.id] = i.name;
                        acc[i.name] = i.id;
                        return acc;
                    }, {});
                    return [4 /*yield*/, write_debug_file_1.write_debug_file(dataElementLookup, 'dataElementLookup')];
                case 5:
                    _a.sent();
                    return [2 /*return*/, { dataValueSets: dataValueSets, orgUnitsFeatures: orgUnitsFeatures, dataElementLookup: dataElementLookup }];
            }
        });
    });
}
exports.get_data_from_dhis2 = get_data_from_dhis2;
function get_metadata() {
    return __awaiter(this, void 0, void 0, function () {
        var metadata_url, metadata_res, metadata;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    metadata_url = config_1.default.dhis2_root_url + "/api/metadata.json?assumeTrue=false&dataElements=true&organisationUnits=true&dataSets=true&users=true";
                    return [4 /*yield*/, node_fetch_1.default(metadata_url, { headers: config_1.default.dhis2_headers })];
                case 1:
                    metadata_res = _a.sent();
                    return [4 /*yield*/, metadata_res.json()];
                case 2:
                    metadata = _a.sent();
                    return [4 /*yield*/, write_debug_file_1.write_debug_file(metadata, 'metadata')];
                case 3:
                    _a.sent();
                    return [2 /*return*/, metadata];
            }
        });
    });
}
function get_dataValueSets(dataSetId, orgUnitParams) {
    return __awaiter(this, void 0, void 0, function () {
        var dataValueSetsUrl, dataValueSetsUrl_res, dataValueSets;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dataValueSetsUrl = config_1.default.dhis2_root_url + "/api/dataValueSets.json?dataSet=" + dataSetId + "&period=" + config_1.default.static_period + orgUnitParams;
                    return [4 /*yield*/, node_fetch_1.default(dataValueSetsUrl, { headers: config_1.default.dhis2_headers })];
                case 1:
                    dataValueSetsUrl_res = _a.sent();
                    return [4 /*yield*/, dataValueSetsUrl_res.json()];
                case 2:
                    dataValueSets = _a.sent();
                    return [4 /*yield*/, write_debug_file_1.write_debug_file(dataValueSets, 'dataValueSets')];
                case 3:
                    _a.sent();
                    return [2 /*return*/, dataValueSets];
            }
        });
    });
}
function write_result_to_dhis2(data_for_dhis2) {
    return __awaiter(this, void 0, void 0, function () {
        var post_data_to_dhis2_url, post_data_to_dhis2_res, post_data_to_dhis2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    post_data_to_dhis2_url = config_1.default.dhis2_root_url + "/api/dataValueSets.json?importStrategy=UPDATE";
                    return [4 /*yield*/, node_fetch_1.default(post_data_to_dhis2_url, {
                            method: 'post',
                            headers: __assign(__assign({}, config_1.default.dhis2_headers), { 'Content-Type': 'application/json' }),
                            body: JSON.stringify(data_for_dhis2)
                        })];
                case 1:
                    post_data_to_dhis2_res = _a.sent();
                    return [4 /*yield*/, post_data_to_dhis2_res.json()];
                case 2:
                    post_data_to_dhis2 = _a.sent();
                    return [4 /*yield*/, write_debug_file_1.write_debug_file(post_data_to_dhis2, 'response_from_dhis2')];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.write_result_to_dhis2 = write_result_to_dhis2;
function trigger_dhis2_analytics(delay) {
    if (delay === void 0) { delay = 2000; }
    return __awaiter(this, void 0, void 0, function () {
        var dhis2_trigger_analytics_url, dhis2_trigger_analytics_res, dhis2_trigger_analytics;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Include a delay, to be certain DB writing has finished inside DHIS2
                return [4 /*yield*/, new Promise(function (resolve, _) {
                        setTimeout(function () {
                            console.log('Trigger analytics');
                            resolve();
                        }, delay);
                    })];
                case 1:
                    // Include a delay, to be certain DB writing has finished inside DHIS2
                    _a.sent();
                    dhis2_trigger_analytics_url = config_1.default.dhis2_root_url + "/api/resourceTables/analytics";
                    return [4 /*yield*/, node_fetch_1.default(dhis2_trigger_analytics_url, {
                            method: 'post',
                            headers: config_1.default.dhis2_headers
                        })];
                case 2:
                    dhis2_trigger_analytics_res = _a.sent();
                    return [4 /*yield*/, dhis2_trigger_analytics_res.json()];
                case 3:
                    dhis2_trigger_analytics = _a.sent();
                    return [4 /*yield*/, write_debug_file_1.write_debug_file(dhis2_trigger_analytics, 'response_from_dhis2_analytics_bump')];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.trigger_dhis2_analytics = trigger_dhis2_analytics;
