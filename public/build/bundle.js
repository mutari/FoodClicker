
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.26.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const socket = io.connect(address);

    function init$1() {
        socket.on('connect', function(data) {

        });
    }

    function send(path, obj) {
        socket.emit(path, obj);
    }

    function listen$1(path, _callback) {
        socket.on(path, _callback);
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const players = writable([
        {
            name: "player1",
            id: "0198219",
            path: "./res/jobb.png",
            amount: 0,
            me: false,
            connected: false,
            not_me_connected: false,
            aps: 1
        },
        {
            name: "player1",
            id: "1213234",
            path: "./res/jobb.png",
            amount: 0,
            me: false,
            connected: false,
            not_me_connected: false,
            aps: 1
        },
        {
            name: "player2",
            id: "1234213",
            path: "./res/jobb.png",
            amount: 0,
            me: false,
            connected: false,
            not_me_connected: false,
            aps: 1
        },
        {
            name: "player3",
            id: "1234325",
            path: "./res/jobb.png",
            amount: 0,
            me: false,
            connected: false,
            not_me_connected: false,
            aps: 1
        }
    ]);

    const game = writable({
        one_connected: false,
        started: false,
        timer: 1000*60*2,
        start_time: Date.now(),
        end_time: 0
    });

    /* src/Shop.svelte generated by Svelte v3.26.0 */

    const { console: console_1 } = globals;
    const file = "src/Shop.svelte";

    function create_fragment(ctx) {
    	let div;
    	let h3;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let p0;
    	let t5;
    	let t6;
    	let p1;
    	let t7;
    	let t8;
    	let t9;
    	let t10;
    	let t11;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text(/*name*/ ctx[1]);
    			t1 = text(" (");
    			t2 = text(/*amount*/ ctx[3]);
    			t3 = text(")");
    			t4 = space();
    			p0 = element("p");
    			t5 = text(/*dis*/ ctx[2]);
    			t6 = space();
    			p1 = element("p");
    			t7 = text("Prise: ");
    			t8 = text(/*price*/ ctx[4]);
    			t9 = text(", aps: ");
    			t10 = text(/*aps*/ ctx[0]);
    			t11 = space();
    			button = element("button");
    			button.textContent = "buy";
    			add_location(h3, file, 34, 4, 1017);
    			add_location(p0, file, 35, 4, 1048);
    			add_location(button, file, 36, 34, 1095);
    			add_location(p1, file, 36, 4, 1065);
    			attr_dev(div, "class", "svelte-of3h6s");
    			add_location(div, file, 33, 0, 1007);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, t0);
    			append_dev(h3, t1);
    			append_dev(h3, t2);
    			append_dev(h3, t3);
    			append_dev(div, t4);
    			append_dev(div, p0);
    			append_dev(p0, t5);
    			append_dev(div, t6);
    			append_dev(div, p1);
    			append_dev(p1, t7);
    			append_dev(p1, t8);
    			append_dev(p1, t9);
    			append_dev(p1, t10);
    			append_dev(p1, t11);
    			append_dev(p1, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*buy*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 2) set_data_dev(t0, /*name*/ ctx[1]);
    			if (dirty & /*amount*/ 8) set_data_dev(t2, /*amount*/ ctx[3]);
    			if (dirty & /*dis*/ 4) set_data_dev(t5, /*dis*/ ctx[2]);
    			if (dirty & /*price*/ 16) set_data_dev(t8, /*price*/ ctx[4]);
    			if (dirty & /*aps*/ 1) set_data_dev(t10, /*aps*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $players;
    	validate_store(players, "players");
    	component_subscribe($$self, players, $$value => $$invalidate(9, $players = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Shop", slots, []);
    	let { startPrice } = $$props;
    	let { modules } = $$props;
    	let { name } = $$props;
    	let { dis } = $$props;
    	let { aps } = $$props;
    	let { playerIndex } = $$props;
    	let amount = 0;
    	let price = startPrice;

    	function buy() {
    		console.log("test");

    		if ($players[playerIndex].amount >= parseInt(price)) {
    			set_store_value(players, $players[playerIndex].amount -= parseInt(price), $players);
    			set_store_value(players, $players[playerIndex].aps += parseInt(aps), $players);
    			$$invalidate(4, price = parseInt(parseInt(price) * parseFloat(modules)));
    			$$invalidate(3, amount++, amount);

    			send("ShopUpdate", {
    				startPrice,
    				modules,
    				name,
    				dis,
    				aps,
    				playerIndex,
    				amount,
    				price
    			});
    		}
    	}

    	listen$1("ShopUpdate", data => {
    		if (data.playerIndex == playerIndex && data.name == name) {
    			$$invalidate(0, aps = data.aps);
    			$$invalidate(3, amount = data.amount);
    			$$invalidate(4, price = data.price);
    		}
    	});

    	const writable_props = ["startPrice", "modules", "name", "dis", "aps", "playerIndex"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Shop> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("startPrice" in $$props) $$invalidate(6, startPrice = $$props.startPrice);
    		if ("modules" in $$props) $$invalidate(7, modules = $$props.modules);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("dis" in $$props) $$invalidate(2, dis = $$props.dis);
    		if ("aps" in $$props) $$invalidate(0, aps = $$props.aps);
    		if ("playerIndex" in $$props) $$invalidate(8, playerIndex = $$props.playerIndex);
    	};

    	$$self.$capture_state = () => ({
    		send,
    		listen: listen$1,
    		players,
    		startPrice,
    		modules,
    		name,
    		dis,
    		aps,
    		playerIndex,
    		amount,
    		price,
    		buy,
    		$players
    	});

    	$$self.$inject_state = $$props => {
    		if ("startPrice" in $$props) $$invalidate(6, startPrice = $$props.startPrice);
    		if ("modules" in $$props) $$invalidate(7, modules = $$props.modules);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("dis" in $$props) $$invalidate(2, dis = $$props.dis);
    		if ("aps" in $$props) $$invalidate(0, aps = $$props.aps);
    		if ("playerIndex" in $$props) $$invalidate(8, playerIndex = $$props.playerIndex);
    		if ("amount" in $$props) $$invalidate(3, amount = $$props.amount);
    		if ("price" in $$props) $$invalidate(4, price = $$props.price);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [aps, name, dis, amount, price, buy, startPrice, modules, playerIndex];
    }

    class Shop extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			startPrice: 6,
    			modules: 7,
    			name: 1,
    			dis: 2,
    			aps: 0,
    			playerIndex: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Shop",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*startPrice*/ ctx[6] === undefined && !("startPrice" in props)) {
    			console_1.warn("<Shop> was created without expected prop 'startPrice'");
    		}

    		if (/*modules*/ ctx[7] === undefined && !("modules" in props)) {
    			console_1.warn("<Shop> was created without expected prop 'modules'");
    		}

    		if (/*name*/ ctx[1] === undefined && !("name" in props)) {
    			console_1.warn("<Shop> was created without expected prop 'name'");
    		}

    		if (/*dis*/ ctx[2] === undefined && !("dis" in props)) {
    			console_1.warn("<Shop> was created without expected prop 'dis'");
    		}

    		if (/*aps*/ ctx[0] === undefined && !("aps" in props)) {
    			console_1.warn("<Shop> was created without expected prop 'aps'");
    		}

    		if (/*playerIndex*/ ctx[8] === undefined && !("playerIndex" in props)) {
    			console_1.warn("<Shop> was created without expected prop 'playerIndex'");
    		}
    	}

    	get startPrice() {
    		throw new Error("<Shop>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set startPrice(value) {
    		throw new Error("<Shop>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get modules() {
    		throw new Error("<Shop>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set modules(value) {
    		throw new Error("<Shop>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Shop>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Shop>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dis() {
    		throw new Error("<Shop>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dis(value) {
    		throw new Error("<Shop>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get aps() {
    		throw new Error("<Shop>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set aps(value) {
    		throw new Error("<Shop>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get playerIndex() {
    		throw new Error("<Shop>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set playerIndex(value) {
    		throw new Error("<Shop>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Player_area.svelte generated by Svelte v3.26.0 */

    const { Object: Object_1, console: console_1$1 } = globals;
    const file$1 = "src/Player_area.svelte";

    // (69:4) {:else}
    function create_else_block_2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*$players*/ ctx[2][/*index*/ ctx[0]].path)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "click image");
    			attr_dev(img, "class", "svelte-baavhi");
    			add_location(img, file$1, 69, 8, 2148);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$players, index*/ 5 && img.src !== (img_src_value = /*$players*/ ctx[2][/*index*/ ctx[0]].path)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(69:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (67:4) {#if $players[index].connected}
    function create_if_block_4(ctx) {
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*$players*/ ctx[2][/*index*/ ctx[0]].path)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "click image");
    			attr_dev(img, "class", "svelte-baavhi");
    			add_location(img, file$1, 67, 8, 2048);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);

    			if (!mounted) {
    				dispose = listen_dev(img, "click", /*clickFunction*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$players, index*/ 5 && img.src !== (img_src_value = /*$players*/ ctx[2][/*index*/ ctx[0]].path)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(67:4) {#if $players[index].connected}",
    		ctx
    	});

    	return block;
    }

    // (78:4) {#if !$game.started}
    function create_if_block(ctx) {
    	let div;

    	function select_block_type_1(ctx, dirty) {
    		if (!/*$players*/ ctx[2][/*index*/ ctx[0]].connected) return create_if_block_1;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "id", "connecting");
    			attr_dev(div, "class", "svelte-baavhi");
    			add_location(div, file$1, 78, 8, 2511);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(78:4) {#if !$game.started}",
    		ctx
    	});

    	return block;
    }

    // (89:12) {:else  }
    function create_else_block_1(ctx) {
    	let h1;
    	let t0;
    	let t1_value = /*$players*/ ctx[2][/*index*/ ctx[0]].name + "";
    	let t1;
    	let t2;
    	let h3;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text("hello ");
    			t1 = text(t1_value);
    			t2 = space();
    			h3 = element("h3");
    			h3.textContent = "Waiting on others to join";
    			attr_dev(h1, "class", "load svelte-baavhi");
    			add_location(h1, file$1, 89, 16, 3051);
    			attr_dev(h3, "class", "load svelte-baavhi");
    			add_location(h3, file$1, 90, 16, 3118);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, h3, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$players, index*/ 5 && t1_value !== (t1_value = /*$players*/ ctx[2][/*index*/ ctx[0]].name + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(89:12) {:else  }",
    		ctx
    	});

    	return block;
    }

    // (80:12) {#if !$players[index].connected}
    function create_if_block_1(ctx) {
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (!/*$game*/ ctx[3].one_connected) return create_if_block_2;
    		if (/*$players*/ ctx[2][/*index*/ ctx[0]].not_me_connected) return create_if_block_3;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(80:12) {#if !$players[index].connected}",
    		ctx
    	});

    	return block;
    }

    // (86:16) {:else}
    function create_else_block(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Waiting for this person";
    			attr_dev(h3, "class", "load svelte-baavhi");
    			add_location(h3, file$1, 86, 20, 2945);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(86:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (84:59) 
    function create_if_block_3(ctx) {
    	let h3;
    	let t0;
    	let t1_value = /*$players*/ ctx[2][/*index*/ ctx[0]].name + "";
    	let t1;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t0 = text("this is ");
    			t1 = text(t1_value);
    			attr_dev(h3, "class", "load svelte-baavhi");
    			add_location(h3, file$1, 84, 20, 2848);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t0);
    			append_dev(h3, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$players, index*/ 5 && t1_value !== (t1_value = /*$players*/ ctx[2][/*index*/ ctx[0]].name + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(84:59) ",
    		ctx
    	});

    	return block;
    }

    // (81:16) {#if !$game.one_connected}
    function create_if_block_2(ctx) {
    	let input;
    	let t0;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			button = element("button");
    			button.textContent = "connect";
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "name");
    			add_location(input, file$1, 81, 20, 2641);
    			add_location(button, file$1, 82, 20, 2722);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*username*/ ctx[1]);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[6]),
    					listen_dev(button, "click", /*connect*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*username*/ 2 && input.value !== /*username*/ ctx[1]) {
    				set_input_value(input, /*username*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(81:16) {#if !$game.one_connected}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div1;
    	let h1;
    	let t0_value = /*$players*/ ctx[2][/*index*/ ctx[0]].name + "";
    	let t0;
    	let t1;
    	let h3;
    	let t2;
    	let t3_value = /*$players*/ ctx[2][/*index*/ ctx[0]].amount + "";
    	let t3;
    	let t4;
    	let t5;
    	let div0;
    	let shop0;
    	let t6;
    	let shop1;
    	let t7;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (/*$players*/ ctx[2][/*index*/ ctx[0]].connected) return create_if_block_4;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	shop0 = new Shop({
    			props: {
    				name: "Upgrade1",
    				dis: "This is upgrade 1",
    				startPrice: "10",
    				modules: "2",
    				aps: "1",
    				playerIndex: /*index*/ ctx[0]
    			},
    			$$inline: true
    		});

    	shop1 = new Shop({
    			props: {
    				name: "Upgrade2",
    				dis: "This is upgrade 2",
    				startPrice: "400",
    				modules: "1.5",
    				aps: "4",
    				playerIndex: /*index*/ ctx[0]
    			},
    			$$inline: true
    		});

    	let if_block1 = !/*$game*/ ctx[3].started && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			h3 = element("h3");
    			t2 = text("points: ");
    			t3 = text(t3_value);
    			t4 = space();
    			if_block0.c();
    			t5 = space();
    			div0 = element("div");
    			create_component(shop0.$$.fragment);
    			t6 = space();
    			create_component(shop1.$$.fragment);
    			t7 = space();
    			if (if_block1) if_block1.c();
    			add_location(h1, file$1, 63, 4, 1925);
    			add_location(h3, file$1, 64, 4, 1961);
    			attr_dev(div0, "class", "shop svelte-baavhi");
    			add_location(div0, file$1, 72, 4, 2216);
    			attr_dev(div1, "class", "svelte-baavhi");
    			add_location(div1, file$1, 62, 0, 1915);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h1);
    			append_dev(h1, t0);
    			append_dev(div1, t1);
    			append_dev(div1, h3);
    			append_dev(h3, t2);
    			append_dev(h3, t3);
    			append_dev(div1, t4);
    			if_block0.m(div1, null);
    			append_dev(div1, t5);
    			append_dev(div1, div0);
    			mount_component(shop0, div0, null);
    			append_dev(div0, t6);
    			mount_component(shop1, div0, null);
    			append_dev(div1, t7);
    			if (if_block1) if_block1.m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$players, index*/ 5) && t0_value !== (t0_value = /*$players*/ ctx[2][/*index*/ ctx[0]].name + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*$players, index*/ 5) && t3_value !== (t3_value = /*$players*/ ctx[2][/*index*/ ctx[0]].amount + "")) set_data_dev(t3, t3_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div1, t5);
    				}
    			}

    			const shop0_changes = {};
    			if (dirty & /*index*/ 1) shop0_changes.playerIndex = /*index*/ ctx[0];
    			shop0.$set(shop0_changes);
    			const shop1_changes = {};
    			if (dirty & /*index*/ 1) shop1_changes.playerIndex = /*index*/ ctx[0];
    			shop1.$set(shop1_changes);

    			if (!/*$game*/ ctx[3].started) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(shop0.$$.fragment, local);
    			transition_in(shop1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(shop0.$$.fragment, local);
    			transition_out(shop1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_block0.d();
    			destroy_component(shop0);
    			destroy_component(shop1);
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $players;
    	let $game;
    	validate_store(players, "players");
    	component_subscribe($$self, players, $$value => $$invalidate(2, $players = $$value));
    	validate_store(game, "game");
    	component_subscribe($$self, game, $$value => $$invalidate(3, $game = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Player_area", slots, []);
    	let { index } = $$props;
    	let username;

    	function connect() {
    		console.log("username: ", username);
    		send("join", { username, posID: index });

    		listen$1("join", data => {
    			set_store_value(players, $players[index].id = data.id, $players);
    			set_store_value(players, $players[index].connected = true, $players);
    			set_store_value(players, $players[index].name = username, $players);
    			set_store_value(players, $players[index].me = true, $players);
    			set_store_value(game, $game.one_connected = true, $game);

    			data.players.forEach(e => {
    				find = false;
    				console.log(data.players, $players);

    				$players.forEach(el => {
    					if (e.id == el.id) {
    						find = true;
    					}
    				});

    				if (!find) {
    					set_store_value(players, $players[e.posID] = Object.assign($players[e.posID], e, { not_me_connected: true }), $players);
    					console.log("last: ", $players);
    				}
    			});
    		});

    		listen$1("NotAllowd", () => {
    			alert("That pos or thet name is uptaget");
    		});

    		listen$1("update_players", data => {
    			data.forEach(e => {
    				find = false;
    				console.log(data, $players);

    				$players.forEach(el => {
    					if (e.id == el.id) {
    						find = true;
    					}
    				});

    				if (!find) {
    					set_store_value(players, $players[e.posID] = Object.assign($players[e.posID], e, { not_me_connected: true }), $players);
    					console.log("last: ", $players);
    				}
    			});
    		});
    	}

    	function clickFunction() {
    		if ($players[index].connected) {
    			set_store_value(players, $players[index].amount += $players[index].aps, $players);
    		}
    	}

    	const writable_props = ["index"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Player_area> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		username = this.value;
    		$$invalidate(1, username);
    	}

    	$$self.$$set = $$props => {
    		if ("index" in $$props) $$invalidate(0, index = $$props.index);
    	};

    	$$self.$capture_state = () => ({
    		Shop,
    		game,
    		players,
    		send,
    		listen: listen$1,
    		index,
    		username,
    		connect,
    		clickFunction,
    		$players,
    		$game
    	});

    	$$self.$inject_state = $$props => {
    		if ("index" in $$props) $$invalidate(0, index = $$props.index);
    		if ("username" in $$props) $$invalidate(1, username = $$props.username);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [index, username, $players, $game, connect, clickFunction, input_input_handler];
    }

    class Player_area extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { index: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Player_area",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*index*/ ctx[0] === undefined && !("index" in props)) {
    			console_1$1.warn("<Player_area> was created without expected prop 'index'");
    		}
    	}

    	get index() {
    		throw new Error("<Player_area>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Player_area>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Menu.svelte generated by Svelte v3.26.0 */

    const { console: console_1$2 } = globals;
    const file$2 = "src/Menu.svelte";

    // (56:0) {#if $game.one_connected & !$game.started & getIdOfConnected() == 0}
    function create_if_block_1$1(ctx) {
    	let div;
    	let button;
    	let t1;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Start game";
    			t1 = space();
    			input = element("input");
    			attr_dev(button, "class", "svelte-1qjaym0");
    			add_location(button, file$2, 57, 8, 1144);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "placeholder", "sec");
    			attr_dev(input, "min", "1");
    			add_location(input, file$2, 58, 8, 1199);
    			attr_dev(div, "id", "menu");
    			attr_dev(div, "class", "svelte-1qjaym0");
    			add_location(div, file$2, 56, 4, 1120);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(div, t1);
    			append_dev(div, input);
    			set_input_value(input, /*sec*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*start*/ ctx[2], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[4])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*sec*/ 1 && to_number(input.value) !== /*sec*/ ctx[0]) {
    				set_input_value(input, /*sec*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(56:0) {#if $game.one_connected & !$game.started & getIdOfConnected() == 0}",
    		ctx
    	});

    	return block;
    }

    // (63:0) {#if $game.started}
    function create_if_block$1(ctx) {
    	let div;
    	let h1;
    	let t_value = (/*$game*/ ctx[1].end_time - /*$game*/ ctx[1].start_time) / 1000 + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			t = text(t_value);
    			add_location(h1, file$2, 64, 8, 1333);
    			attr_dev(div, "id", "timer");
    			attr_dev(div, "class", "svelte-1qjaym0");
    			add_location(div, file$2, 63, 4, 1308);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(h1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$game*/ 2 && t_value !== (t_value = (/*$game*/ ctx[1].end_time - /*$game*/ ctx[1].start_time) / 1000 + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(63:0) {#if $game.started}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let show_if = /*$game*/ ctx[1].one_connected & !/*$game*/ ctx[1].started & /*getIdOfConnected*/ ctx[3]() == 0;
    	let t;
    	let if_block1_anchor;
    	let if_block0 = show_if && create_if_block_1$1(ctx);
    	let if_block1 = /*$game*/ ctx[1].started && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$game*/ 2) show_if = /*$game*/ ctx[1].one_connected & !/*$game*/ ctx[1].started & /*getIdOfConnected*/ ctx[3]() == 0;

    			if (show_if) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*$game*/ ctx[1].started) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $game;
    	let $players;
    	validate_store(game, "game");
    	component_subscribe($$self, game, $$value => $$invalidate(1, $game = $$value));
    	validate_store(players, "players");
    	component_subscribe($$self, players, $$value => $$invalidate(5, $players = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Menu", slots, []);
    	let sec = $game.timer / 1000;

    	function timer() {
    		set_store_value(game, $game.started = true, $game);
    		set_store_value(game, $game.timer = 1000 * sec, $game);
    		set_store_value(game, $game.start_time = Date.now(), $game);
    		set_store_value(game, $game.end_time = $game.start_time + $game.timer, $game);

    		let timer = setInterval(
    			() => {
    				console.log("test");
    				if ($game.end_time > $game.start_time) set_store_value(game, $game.start_time += 1000, $game);
    			},
    			1000
    		);
    	}

    	function gameLoop() {
    		listen$1("Update", data => {
    			set_store_value(players, $players[data.posID].amount = data.amount, $players);
    		});

    		let GameLoop = setInterval(
    			() => {
    				$players.forEach(e => {
    					if (e.connected) send("Update", e);
    				});
    			},
    			200
    		);
    	}

    	function start() {
    		timer();
    		send("GameStart", $game);
    		gameLoop();
    	}

    	listen$1("GameStart", data => {
    		console.log(data);
    		set_store_value(game, $game = data, $game);
    		timer();
    		gameLoop();
    	});

    	function getIdOfConnected() {
    		for (let i = 0; i < $players.length; i++) if ($players[i].connected) return i;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		sec = to_number(this.value);
    		$$invalidate(0, sec);
    	}

    	$$self.$capture_state = () => ({
    		game,
    		players,
    		send,
    		listen: listen$1,
    		sec,
    		timer,
    		gameLoop,
    		start,
    		getIdOfConnected,
    		$game,
    		$players
    	});

    	$$self.$inject_state = $$props => {
    		if ("sec" in $$props) $$invalidate(0, sec = $$props.sec);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [sec, $game, start, getIdOfConnected, input_input_handler];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.26.0 */
    const file$3 = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    // (13:2) {#each $players as player, i }
    function create_each_block(ctx) {
    	let playerarea;
    	let current;

    	playerarea = new Player_area({
    			props: { index: /*i*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(playerarea.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(playerarea, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(playerarea.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(playerarea.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(playerarea, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(13:2) {#each $players as player, i }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let menu;
    	let current;
    	let each_value = /*$players*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	menu = new Menu({ $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			create_component(menu.$$.fragment);
    			attr_dev(div0, "id", "player");
    			attr_dev(div0, "class", "svelte-hqhnej");
    			add_location(div0, file$3, 11, 1, 223);
    			attr_dev(div1, "id", "game");
    			attr_dev(div1, "class", "svelte-hqhnej");
    			add_location(div1, file$3, 10, 0, 206);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div1, t);
    			mount_component(menu, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$players*/ 1) {
    				each_value = /*$players*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(menu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(menu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			destroy_component(menu);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $players;
    	validate_store(players, "players");
    	component_subscribe($$self, players, $$value => $$invalidate(0, $players = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	init$1();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		PlayerArea: Player_area,
    		Menu,
    		game,
    		players,
    		init: init$1,
    		send,
    		listen: listen$1,
    		$players
    	});

    	return [$players];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
