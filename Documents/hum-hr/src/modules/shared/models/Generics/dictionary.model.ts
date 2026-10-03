import { KeyValuePair } from "./ikeyValuePair.model";

export class Dictionary<Tkey, T> {
    private values: KeyValuePair<Tkey, T>[] = [];

    Add(key: Tkey, value: T): boolean {
        return this.AddKeyValuePair( {key: key, value: value });
    }

    AddKeyValuePair(value: KeyValuePair<Tkey, T>): boolean {
        if (!value || !value.key) {
            return false;
        }

        if (this.get(value.key)) {
            return false;
        }

        this.values.push(value);
        return true;
    }
    isDictionary(): boolean {
        return true;
    }

    exist(key: Tkey): boolean {
        let exist = false;

        this.values.forEach(v => {
            if (v.key === key) {
                exist = true;
                return;
            }
        });
        return exist;
    }

    get(key: Tkey): T {
        let value: T = null;

        this.values.forEach(v => {
            if (v.key === key) {
                value = v.value;
                return;
            }
        });

        return value;
    }

    removeItem(key:Tkey){
        const index = this.values.findIndex(v => v.key === key);
        this.values.splice(index,1);
    }

    constructor(dictionary?: Dictionary<Tkey, T>) {
        if (dictionary) {
            this.values = dictionary.values;
        }
    }
}
