
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

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
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
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
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
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Button.svelte generated by Svelte v3.38.2 */

    const file$1 = "src/Button.svelte";

    function create_fragment$1(ctx) {
    	let button0;
    	let t0;
    	let button1;
    	let t1;
    	let button2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			t0 = space();
    			button1 = element("button");
    			t1 = space();
    			button2 = element("button");
    			attr_dev(button0, "class", "svelte-1jlk10e");
    			add_location(button0, file$1, 11, 0, 245);
    			attr_dev(button1, "class", "svelte-1jlk10e");
    			add_location(button1, file$1, 12, 0, 282);
    			attr_dev(button2, "class", "svelte-1jlk10e");
    			add_location(button2, file$1, 13, 0, 318);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, button1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button2, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", toggle3, false, false, false),
    					listen_dev(button1, "click", toggle, false, false, false),
    					listen_dev(button2, "click", toggle2, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button2);
    			mounted = false;
    			run_all(dispose);
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

    function toggle() {
    	window.document.body.classList.toggle("dark-mode");
    }

    function toggle2() {
    	window.document.body.classList.toggle("dark-mode2");
    }

    function toggle3() {
    	window.document.body.classList.toggle("dark-mode3");
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ toggle, toggle2, toggle3 });
    	return [];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.38.2 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t3;
    	let h30;
    	let t4;
    	let a0;
    	let t6;
    	let t7;
    	let center;
    	let h20;
    	let a1;
    	let t8;
    	let t9;
    	let h31;
    	let t10;
    	let t11;
    	let t12;
    	let p0;
    	let input0;
    	let t13;
    	let h32;
    	let t17;
    	let h5;
    	let t19;
    	let button;
    	let t20;
    	let h21;
    	let t22;
    	let h33;
    	let t24;
    	let h22;
    	let t25;
    	let t26;
    	let t27;
    	let h23;
    	let a2;
    	let t28;
    	let t29;
    	let p1;
    	let input1;
    	let current;
    	let mounted;
    	let dispose;
    	button = new Button({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = `Välkommen till ${/*name*/ ctx[7]} Svelte!`;
    			t3 = space();
    			h30 = element("h3");
    			t4 = text("Jag jobbar just nu på ");
    			a0 = element("a");
    			a0.textContent = "Svelte tutorial";
    			t6 = text(" för att lära mig mer Svelte.");
    			t7 = space();
    			center = element("center");
    			h20 = element("h2");
    			a1 = element("a");
    			t8 = text(/*worden2*/ ctx[6]);
    			t9 = space();
    			h31 = element("h3");
    			t10 = text("Denhär texten härmar de du skriver i fältet nedan: ");
    			t11 = text(/*nameded*/ ctx[0]);
    			t12 = space();
    			p0 = element("p");
    			input0 = element("input");
    			t13 = space();
    			h32 = element("h3");
    			h32.textContent = `Jag rekommenderar att du testar andra ${/*named*/ ctx[8]}!`;
    			t17 = space();
    			h5 = element("h5");
    			h5.textContent = "Tryck på de små knapparna nedanför!";
    			t19 = space();
    			create_component(button.$$.fragment);
    			t20 = space();
    			h21 = element("h2");
    			h21.textContent = "Om du är lite extra modig idag kanske du vågar svara den legendariska frågan :)";
    			t22 = space();
    			h33 = element("h3");
    			h33.textContent = "Om du tappar en tvål på golvet, är tvålen smutsig eller är golvet rent?";
    			t24 = space();
    			h22 = element("h2");
    			t25 = text("Svaret är ");
    			t26 = text(/*ans*/ ctx[2]);
    			t27 = space();
    			h23 = element("h2");
    			a2 = element("a");
    			t28 = text(/*worden*/ ctx[4]);
    			t29 = space();
    			p1 = element("p");
    			input1 = element("input");
    			attr_dev(h1, "class", "svelte-1lx7kkc");
    			add_location(h1, file, 72, 1, 2098);
    			attr_dev(a0, "href", "https://www.youtube.com/watch?v=XJHIiMXk04E&ab_channel=LolStevenlinLolStevenlin");
    			add_location(a0, file, 73, 27, 2164);
    			attr_dev(h30, "class", "svelte-1lx7kkc");
    			add_location(h30, file, 73, 1, 2138);
    			attr_dev(main, "class", "svelte-1lx7kkc");
    			add_location(main, file, 71, 0, 2090);
    			attr_dev(a1, "href", /*anslink2*/ ctx[5]);
    			add_location(a1, file, 77, 4, 2334);
    			attr_dev(h20, "class", "svelte-1lx7kkc");
    			add_location(h20, file, 77, 0, 2330);
    			attr_dev(h31, "class", "svelte-1lx7kkc");
    			add_location(h31, file, 78, 0, 2372);
    			attr_dev(input0, "class", "svelte-1lx7kkc");
    			add_location(input0, file, 79, 3, 2445);
    			add_location(p0, file, 79, 0, 2442);
    			attr_dev(h32, "class", "svelte-1lx7kkc");
    			add_location(h32, file, 80, 0, 2478);
    			add_location(h5, file, 81, 0, 2535);
    			attr_dev(h21, "class", "svelte-1lx7kkc");
    			add_location(h21, file, 83, 0, 2598);
    			attr_dev(h33, "class", "svelte-1lx7kkc");
    			add_location(h33, file, 84, 0, 2687);
    			attr_dev(h22, "class", "svelte-1lx7kkc");
    			add_location(h22, file, 85, 0, 2768);
    			attr_dev(a2, "href", /*anslink*/ ctx[3]);
    			add_location(a2, file, 86, 4, 2797);
    			attr_dev(h23, "class", "svelte-1lx7kkc");
    			add_location(h23, file, 86, 0, 2793);
    			attr_dev(input1, "class", "svelte-1lx7kkc");
    			add_location(input1, file, 87, 3, 2836);
    			add_location(p1, file, 87, 0, 2833);
    			add_location(center, file, 76, 0, 2321);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t3);
    			append_dev(main, h30);
    			append_dev(h30, t4);
    			append_dev(h30, a0);
    			append_dev(h30, t6);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, center, anchor);
    			append_dev(center, h20);
    			append_dev(h20, a1);
    			append_dev(a1, t8);
    			append_dev(center, t9);
    			append_dev(center, h31);
    			append_dev(h31, t10);
    			append_dev(h31, t11);
    			append_dev(center, t12);
    			append_dev(center, p0);
    			append_dev(p0, input0);
    			set_input_value(input0, /*nameded*/ ctx[0]);
    			append_dev(center, t13);
    			append_dev(center, h32);
    			append_dev(center, t17);
    			append_dev(center, h5);
    			append_dev(center, t19);
    			mount_component(button, center, null);
    			append_dev(center, t20);
    			append_dev(center, h21);
    			append_dev(center, t22);
    			append_dev(center, h33);
    			append_dev(center, t24);
    			append_dev(center, h22);
    			append_dev(h22, t25);
    			append_dev(h22, t26);
    			append_dev(center, t27);
    			append_dev(center, h23);
    			append_dev(h23, a2);
    			append_dev(a2, t28);
    			append_dev(center, t29);
    			append_dev(center, p1);
    			append_dev(p1, input1);
    			set_input_value(input1, /*nameded2*/ ctx[1]);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[9]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[10])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*worden2*/ 64) set_data_dev(t8, /*worden2*/ ctx[6]);

    			if (!current || dirty & /*anslink2*/ 32) {
    				attr_dev(a1, "href", /*anslink2*/ ctx[5]);
    			}

    			if (!current || dirty & /*nameded*/ 1) set_data_dev(t11, /*nameded*/ ctx[0]);

    			if (dirty & /*nameded*/ 1 && input0.value !== /*nameded*/ ctx[0]) {
    				set_input_value(input0, /*nameded*/ ctx[0]);
    			}

    			if (!current || dirty & /*ans*/ 4) set_data_dev(t26, /*ans*/ ctx[2]);
    			if (!current || dirty & /*worden*/ 16) set_data_dev(t28, /*worden*/ ctx[4]);

    			if (!current || dirty & /*anslink*/ 8) {
    				attr_dev(a2, "href", /*anslink*/ ctx[3]);
    			}

    			if (dirty & /*nameded2*/ 2 && input1.value !== /*nameded2*/ ctx[1]) {
    				set_input_value(input1, /*nameded2*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(center);
    			destroy_component(button);
    			mounted = false;
    			run_all(dispose);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let name = "Jonahs";
    	let ans = "...";
    	let anslink = "";
    	let worden = "";
    	let anslink2 = "";
    	let worden2 = "";
    	let named = "bakgrunder";
    	let nameded = "";
    	let nameded2 = "";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		nameded = this.value;
    		$$invalidate(0, nameded);
    	}

    	function input1_input_handler() {
    		nameded2 = this.value;
    		$$invalidate(1, nameded2);
    	}

    	$$self.$capture_state = () => ({
    		name,
    		ans,
    		anslink,
    		worden,
    		anslink2,
    		worden2,
    		Button,
    		named,
    		nameded,
    		nameded2
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(7, name = $$props.name);
    		if ("ans" in $$props) $$invalidate(2, ans = $$props.ans);
    		if ("anslink" in $$props) $$invalidate(3, anslink = $$props.anslink);
    		if ("worden" in $$props) $$invalidate(4, worden = $$props.worden);
    		if ("anslink2" in $$props) $$invalidate(5, anslink2 = $$props.anslink2);
    		if ("worden2" in $$props) $$invalidate(6, worden2 = $$props.worden2);
    		if ("named" in $$props) $$invalidate(8, named = $$props.named);
    		if ("nameded" in $$props) $$invalidate(0, nameded = $$props.nameded);
    		if ("nameded2" in $$props) $$invalidate(1, nameded2 = $$props.nameded2);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*nameded2*/ 2) {
    			if (nameded2 == "tvålen är smutsig") {
    				$$invalidate(2, ans = `Du har låst upp den heliga videon!`);
    				$$invalidate(3, anslink = "https://www.youtube.com/watch?v=3CqU_nd1gIA&ab_channel=LucienVanias");
    				$$invalidate(4, worden = "Helig?");
    			}
    		}

    		if ($$self.$$.dirty & /*nameded2*/ 2) {
    			if (nameded2 == "Tvålen är smutsig") {
    				$$invalidate(2, ans = `Du har låst upp den heliga videon!`);
    				$$invalidate(3, anslink = "https://www.youtube.com/watch?v=3CqU_nd1gIA&ab_channel=LucienVanias");
    				$$invalidate(4, worden = "Helig?");
    			}
    		}

    		if ($$self.$$.dirty & /*nameded2*/ 2) {
    			if (nameded2 == "golvet är rent") {
    				$$invalidate(2, ans = `Nästan rätt!`);
    				$$invalidate(4, worden = "");
    			}
    		}

    		if ($$self.$$.dirty & /*nameded2*/ 2) {
    			if (nameded2 == "Golvet är rent") {
    				$$invalidate(2, ans = `Nästan rätt!`);
    				$$invalidate(4, worden = "");
    			}
    		}

    		if ($$self.$$.dirty & /*nameded2*/ 2) {
    			if (nameded2 == "inget") {
    				$$invalidate(2, ans = "hmm, vad är dethär för video?");
    				$$invalidate(3, anslink = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstleyVEVO");
    				$$invalidate(4, worden = "Never?");
    			}
    		}

    		if ($$self.$$.dirty & /*nameded2*/ 2) {
    			if (nameded2 == "among us") {
    				$$invalidate(2, ans = "Vem är sus?");
    				$$invalidate(3, anslink = "https://www.youtube.com/watch?v=_Vv1mxDj9-Y&ab_channel=BreadDefender");
    				$$invalidate(4, worden = "Who we voting?");
    			}
    		}

    		if ($$self.$$.dirty & /*nameded2*/ 2) {
    			if (nameded2 == "sos") {
    				$$invalidate(2, ans = "Sos?");
    				$$invalidate(3, anslink = "https://www.youtube.com/watch?v=HPd2hiYreyc&ab_channel=BreadDefender");
    				$$invalidate(4, worden = "Help?");
    			}
    		}

    		if ($$self.$$.dirty & /*nameded*/ 1) {
    			if (nameded == "Dababy") {
    				$$invalidate(0, nameded = "Varför skrev du Dababy?");
    				$$invalidate(5, anslink2 = "https://www.youtube.com/watch?v=Nw4kDgR_D2s&ab_channel=spicysoupspicysoup");
    				$$invalidate(6, worden2 = "LettsGo");
    			}
    		}

    		if ($$self.$$.dirty & /*nameded*/ 1) {
    			if (nameded == "Einar") {
    				$$invalidate(0, nameded = "Hm Einar?");
    				$$invalidate(5, anslink2 = "https://www.youtube.com/watch?v=Z9NQatne0xg&list=LL&index=1&t=62s&ab_channel=spicysoupspicysoup");
    				$$invalidate(6, worden2 = "Vad är det här?");
    			}
    		}

    		if ($$self.$$.dirty & /*nameded*/ 1) {
    			if (nameded == "Dababy") {
    				$$invalidate(0, nameded = "Varför skrev du Dababy?");
    				$$invalidate(5, anslink2 = "https://www.youtube.com/watch?v=Nw4kDgR_D2s&ab_channel=spicysoupspicysoup");
    				$$invalidate(6, worden2 = "LettsGo");
    			}
    		}

    		if ($$self.$$.dirty & /*nameded*/ 1) {
    			if (nameded == "Hur mår du?") {
    				$$invalidate(0, nameded = "Bra tack!");
    			}
    		}

    		if ($$self.$$.dirty & /*nameded*/ 1) {
    			if (nameded == "LightsOut") {
    				$$invalidate(0, nameded = "F1?");
    				$$invalidate(5, anslink2 = "https://www.youtube.com/watch?v=wDKXUpQLPmA&ab_channel=iContrastiContrast");
    				$$invalidate(6, worden2 = "And away we go!");
    			}
    		}
    	};

    	return [
    		nameded,
    		nameded2,
    		ans,
    		anslink,
    		worden,
    		anslink2,
    		worden2,
    		name,
    		named,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'Jonahs'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
