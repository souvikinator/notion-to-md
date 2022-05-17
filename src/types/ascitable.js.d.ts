declare module 'asciitable.js' {
    import asciitable from "asciitable.js";

    export interface Options {
        row?:  Row;
        cell?: Cell;
        hr?:   Hr;
    }
    
    export interface Cell {
        paddingLeft?:     string;
        paddingRight?:    string;
        defaultAlignDir?: number;
    }
    
    export interface Hr {
        str?:          string;
        colSeparator?: string;
    }
    
    export interface Row {
        paddingLeft?:  string;
        paddingRight?: string;
        colSeparator?: string;
        lineBreak?:    string;
    }
    

    export default function asciitable(matrix: Array<string[] | null>, options?: Options): string
  }
  