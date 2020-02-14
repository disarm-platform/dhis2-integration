"use strict";
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
var types_1 = require("./types");
var write_debug_file_1 = require("./write_debug_file");
var config_1 = __importDefault(require("./config"));
function prepare_request_for_disarm(dataValueSets, orgUnitsFeatures, dataElementLookup) {
    return __awaiter(this, void 0, void 0, function () {
        var dataValues, features, fn_request;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dataValues = dataValueSets.dataValues;
                    features = orgUnitsFeatures.map(function (feature) {
                        var interim_feature = feature;
                        var _loop_1 = function (field) {
                            if (field) {
                                var looked_up_field_1 = dataElementLookup[field];
                                var found_dataValue = dataValues.find(function (dv) {
                                    return (dv.orgUnit === feature.properties.orgUnit_id) && (dv.dataElement === looked_up_field_1);
                                });
                                if (found_dataValue) {
                                    interim_feature.properties[field] = parseFloat(found_dataValue.value);
                                }
                                else {
                                    console.error('Cannot find dataValue for', field, 'in', interim_feature);
                                }
                            }
                        };
                        for (var field in types_1.PointDataFields) {
                            _loop_1(field);
                        }
                        return interim_feature;
                    });
                    fn_request = {
                        point_data: {
                            type: 'FeatureCollection',
                            features: features,
                        }
                    };
                    return [4 /*yield*/, write_debug_file_1.write_debug_file(fn_request, 'send_to_disarm')];
                case 1:
                    _a.sent();
                    return [2 /*return*/, fn_request];
            }
        });
    });
}
exports.prepare_request_for_disarm = prepare_request_for_disarm;
function run_disarm_algorithm(fn_request) {
    return __awaiter(this, void 0, void 0, function () {
        var run_url, run_res, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    run_url = "" + config_1.default.disarm_fn_url;
                    return [4 /*yield*/, node_fetch_1.default(run_url, {
                            method: 'post',
                            headers: config_1.default.dhis2_headers,
                            body: JSON.stringify(fn_request)
                        })];
                case 1:
                    run_res = _a.sent();
                    return [4 /*yield*/, run_res.json()];
                case 2:
                    result = _a.sent();
                    return [4 /*yield*/, write_debug_file_1.write_debug_file(result, 'disarm_output')];
                case 3:
                    _a.sent();
                    return [2 /*return*/, result];
            }
        });
    });
}
exports.run_disarm_algorithm = run_disarm_algorithm;
function shape_result_for_dhis2(run_response, dataElementLookup) {
    return __awaiter(this, void 0, void 0, function () {
        var result, dataValues, data_for_dhis2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (run_response.function_status === 'error') {
                        throw { name: 'FnError', message: 'Something wrong with DiSARM function' };
                    }
                    result = run_response.result;
                    dataValues = result.features.reduce(function (acc, f) {
                        for (var field in types_1.PointDataFields) {
                            if (field) {
                                var properties = f.properties;
                                var dataElement = dataElementLookup[field];
                                var value = properties[field];
                                var orgUnit = properties.orgUnit_id;
                                var lastUpdated = (new Date()).toISOString();
                                acc.push({
                                    dataElement: dataElement,
                                    value: value,
                                    period: config_1.default.static_period,
                                    orgUnit: orgUnit,
                                    lastUpdated: lastUpdated,
                                });
                            }
                        }
                        return acc;
                    }, []);
                    data_for_dhis2 = {
                        dataValues: dataValues,
                    };
                    return [4 /*yield*/, write_debug_file_1.write_debug_file(data_for_dhis2, 'data_for_dhis2')];
                case 1:
                    _a.sent();
                    return [2 /*return*/, data_for_dhis2];
            }
        });
    });
}
exports.shape_result_for_dhis2 = shape_result_for_dhis2;
