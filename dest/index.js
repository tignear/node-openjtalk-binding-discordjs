"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.dictionary_dir = exports.synthesis = void 0;
var stream_1 = require("stream");
var node_openjtalk_binding_1 = require("node-openjtalk-binding");
var SynthesizedSoundStream = /** @class */ (function (_super) {
    __extends(SynthesizedSoundStream, _super);
    function SynthesizedSoundStream(wave) {
        var _this = _super.call(this) || this;
        _this.destroyed = false;
        _this.pos = 0;
        _this.wave_p = wave.then(function (wave) {
            _this.buf = wave.data;
            if (wave.sampleRate != 48000) {
                _this._emitError(new Error("Invalid sampleRate(Required 48000): " + wave.sampleRate));
                return false;
            }
            return true;
        }, function (err) {
            _this._emitError(err);
            return false;
        });
        return _this;
    }
    SynthesizedSoundStream.prototype._emitError = function (err) {
        if (!this.destroyed) {
            this.emit("error", err);
        }
    };
    SynthesizedSoundStream.prototype._read = function (size) {
        var _this = this;
        if (size === void 0) { size = 48000 * 2 * 2 / 1000 * 20; }
        if (!this.buf) {
            this.wave_p.then(function (continues) {
                if (continues) {
                    _this._read(size);
                }
            });
            return;
        }
        var buf = Buffer.alloc(size);
        var dst = new Int16Array(buf.buffer);
        var offset = this.pos;
        var end = Math.ceil(size / 4);
        if (end + offset > this.buf.length) {
            end = this.buf.length - offset;
        }
        for (var i = 0; i < end; ++i) {
            var elem = this.buf[i + offset];
            dst[i * 2] = elem;
            dst[i * 2 + 1] = elem;
        }
        this.push(buf);
        this.pos += end;
        if (this.pos == this.buf.length) {
            this.buf = null;
            this.push(null);
        }
    };
    SynthesizedSoundStream.prototype._destroy = function () {
        this.wave_p = Promise.resolve(false);
        this.destroyed = false;
    };
    return SynthesizedSoundStream;
}(stream_1.Readable));
/**
 *
 * @param text Text to synthesize.
 * @param options OpenJTalk options excluded sampling_frequency.
 * @returns Stream of 48kHz 16bit stereo PCM.
 */
function synthesis(text, options) {
    if ("sampling_frequency" in options && (options.sampling_frequency != null || options.sampling_frequency != 48000)) {
        throw new TypeError("Do not set sampling_frequency");
    }
    var p_wave = node_openjtalk_binding_1.synthesis(text, __assign(__assign({ dictionary: exports.dictionary_dir }, options), { sampling_frequency: 48000 }));
    return new SynthesizedSoundStream(p_wave);
}
exports.synthesis = synthesis;
exports.dictionary_dir = node_openjtalk_binding_1.dictionary_dir;
