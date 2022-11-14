// @ts-ignore
import eigen_gen from "./eigen_gen.js";
import {EmscriptenMemoryManager} from "./emscripten-memory-manager"

let _module: any = {current: undefined}
export class EigenModule {
    static module(): any { return  _module.current; }
    static mm: EmscriptenMemoryManager = new EmscriptenMemoryManager();
    static async init(){
        if(!_module.current) {
            _module.current = await eigen_gen();
        }
    }
}