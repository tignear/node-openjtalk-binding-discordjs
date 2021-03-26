/// <reference types="node" />
import { Readable } from "stream";
import { OpenJTalkOptions as _OpenJTalkOptions } from "node-openjtalk-binding";
export declare type OpenJTalkOptions = Omit<_OpenJTalkOptions, "sampling_frequency" | "dictionary"> & {
    dictionary?: string;
};
/**
 *
 * @param text Text to synthesize.
 * @param options OpenJTalk options excluded sampling_frequency.
 * @returns Stream of 48kHz 16bit stereo PCM.
 */
export declare function synthesis(text: string, options: OpenJTalkOptions): Readable;
export declare const dictionary_dir: string;
