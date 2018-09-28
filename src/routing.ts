namespace metron {
    export namespace routing {
        export function config(options: any): void {
            metron.globals.pager.root = options && options.root ? '/' + clearSlashes(options.root) + '/' : '/';
        }
        export function getFragment(): string {
            let match = window.location.href.match(/#(.*)$/);
            let fragment = match ? match[1] : "";
            if(fragment.lastIndexOf("/") != -1) {
                fragment = fragment.substring(0, fragment.lastIndexOf("/"));
            }
            return clearSlashes(fragment);
        }
        export function clearSlashes(path: string): string {
            return path.toString().replace(/\/$/, "").replace(/^\//, "");
        }
        export function add(re, handler): void {
            if(typeof re == "function") {
                handler = re;
                re = "";
            }
            metron.globals.pager.pages.push({ re: re, handler: handler});
        }
        export function remove(param: any): void {
            for(let i = 0, r; i < metron.globals.pager.pages.length, r = metron.globals.pager.pages[i]; i++) {
                if(r.handler === param || r.re.toString() === param.toString()) {
                    metron.globals.pager.pages.splice(i, 1); 
                }
            }
        }
        export function flush(): void {
            metron.globals.pager.pages = [];
            metron.globals.pager.root = "/";
        }
        export function check(f?: string): any {
            var fragment = f || getFragment();
            for(var i = 0; i < metron.globals.pager.pages.length; i++) {
                var match = fragment.match(metron.globals.pager.pages[i].re);
                if(match) {
                    match.shift();
                    metron.globals.pager.pages[i].handler.apply({}, match);
                    return metron.globals.pager;
                }           
            }
            return metron.globals.pager;
        }
        export function listen(): void {
            var current = getFragment();
            var fn = function() {
                if(current !== getFragment()) {
                    current = getFragment();
                    check(current);
                }
            }
            clearInterval(metron.globals.pager.interval);
            metron.globals.pager.interval = setInterval(fn, 50);
        }
        export function navigate(path: string, replace: boolean = false, callback?: Function): void {
            path = path ? path : '';
            if(replace) {
                history.replaceState(null, null, `#/${path}/`);
            }
            else {
                history.pushState(null, null, `#/${path}/`);
            }
            if(callback !== undefined) {
                callback();
            }
        }
        export function setRouteUrl(name: string, wsqs: string, wantsReplaceHash: boolean = false): void {
            var hash = (wsqs.length > 1) ? wsqs.substr(1) : "";
            if (hash != "" && document.location.search != null) {
                try {
                    let hashItems = metron.tools.formatOptions(hash, metron.OptionTypes.QUERYSTRING);
                    let qsItems = metron.tools.formatOptions((document.location.search.startsWith("?") ? document.location.search.substr(1) : document.location.search), metron.OptionTypes.QUERYSTRING);
                    for (let h in hashItems) {
                        if (hashItems.hasOwnProperty(h)) {
                            if (qsItems[h] != null) {
                                delete hashItems[h];
                            }
                        }
                    }
                    hash = metron.web.querystringify(hashItems).substr(1);
                }
                catch (e) {
                    console.log(`Error: failed to parse query string and hash. ${e}`);
                }
            }
            if (name != null) {
                hash = `/${name}/${hash}`;
            }
            metron.globals.hashLoadedFromApplication = true;
            if (hash != null && hash != "") {
                (wantsReplaceHash) ? document.location.hash = `#${hash}` : history.replaceState({}, "", `#${hash}`);
            }
        }
        export function getRouteUrl(filters?: any): any {
            var hash = document.location.hash;
            if (hash.substr(0, 1) == "#") {
                hash = hash.substr(1);
            }
            if (hash.substr(0, 1) == "/") {
                hash = hash.substr(1);
            }
            if (hash.length > 1) {
                if (hash.indexOf("/") != -1) {
                    try {
                        hash = hash.split("/")[1];
                    }
                    catch (e) {
                        console.log(`Error: Failed to get routing. ${e}`);
                    }
                }
                try {
                    let result = metron.tools.formatOptions(hash, metron.OptionTypes.QUERYSTRING);
                    if (filters != null) {
                        for (let h in result) {
                            if (result.hasOwnProperty(h)) {
                                if (filters[h] != null) { //This should be checking for undefined.
                                    delete result[h];
                                }
                            }
                        }
                    }
                    return result;
                }
                catch(e) {
                    console.log(`Error formatting options in getRouteUrl(): ${e}`);
                }
            }
            return null;
        }
        export function getRouteName(): string {
            var hash = document.location.hash;
            if (hash.substr(0, 1) == "#") {
                hash = hash.substr(1);
            }
            if (hash.substr(0, 1) == "/") {
                hash = hash.substr(1);
            }
            if (hash.length > 1) {
                if (hash.indexOf("/") != -1) {
                    try {
                        hash = hash.split("/")[0];
                    }
                    catch (e) {
                        console.log(`Error: Failed to get routing. ${e}`);
                        return null;
                    }
                }
                return hash;
            }
            return null;
        }
    }
}