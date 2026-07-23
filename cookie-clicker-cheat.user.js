// ==UserScript==
// @name         Cookie Clicker Cheat
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Cheat menu pour Cookie Clicker
// @author       You
// @match        https://orteil.dashnet.org/cookieclicker/
// @match        http://orteil.dashnet.org/cookieclicker/
// @icon         https://orteil.dashnet.org/cookieclicker/img/favicon.ico
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const waitForGame = setInterval(() => {
        if (typeof Game === 'undefined' || !Game.ready) return;
        clearInterval(waitForGame);
        initCheat();
    }, 500);

    function initCheat() {
        createUI();
        startAutoClicker();
        startGoldenCookieLoop();
        startAutoHarvestLoop();
        startAutoBuyLoop();
        startStatsLoop();
    }

    // ─── AUTO CLICKER ───────────────────────────────────────────────
    let autoClickerInterval = null;
    let autoClickerSpeed = 50;
    let autoClickerEnabled = false;

    function startAutoClicker() {
        autoClickerInterval = setInterval(() => {
            if (autoClickerEnabled) Game.ClickCookie();
        }, autoClickerSpeed);
    }

    // ─── AUTO GOLDEN COOKIE ─────────────────────────────────────────
    let autoGoldenEnabled = false;

    function startGoldenCookieLoop() {
        setInterval(() => {
            if (!autoGoldenEnabled) return;
            // Shimmer = golden cookies, reindeer, etc.
            Game.shimmers.forEach(s => s.pop());
        }, 300);
    }

    // ─── AUTO HARVEST SUGAR LUMP ────────────────────────────────────
    let autoHarvestEnabled = false;

    function startAutoHarvestLoop() {
        setInterval(() => {
            if (!autoHarvestEnabled) return;
            if (Game.lumpT && Date.now() - Game.lumpT >= Game.lumpRipeAge) {
                Game.clickLump();
            }
        }, 2000);
    }

    // ─── AUTO BUY ───────────────────────────────────────────────────
    let autoBuyEnabled = false;
    // Achète automatiquement le bâtiment le moins cher disponible
    function startAutoBuyLoop() {
        setInterval(() => {
            if (!autoBuyEnabled) return;
            // Acheter les upgrades disponibles
            for (const id in Game.UpgradesInStore) {
                const u = Game.UpgradesInStore[id];
                if (u && u.canBuy()) u.buy();
            }
            // Acheter le bâtiment le moins cher
            let cheapest = null;
            for (const b of Game.ObjectsById) {
                if (!b) continue;
                if (b.price <= Game.cookies) {
                    if (!cheapest || b.price < cheapest.price) cheapest = b;
                }
            }
            if (cheapest) cheapest.buy(1);
        }, 1000);
    }

    // ─── AUTO POP WRINKLERS ─────────────────────────────────────────
    let autoWrinklerEnabled = false;

    // ─── STATS EN TEMPS RÉEL ────────────────────────────────────────
    function startStatsLoop() {
        setInterval(() => {
            const el = document.getElementById('stat-cps');
            if (el) el.textContent = formatNum(Game.cookiesPs) + ' /s';
            const el2 = document.getElementById('stat-cookies');
            if (el2) el2.textContent = formatNum(Game.cookies);
            // Pop wrinklers si activé
            if (autoWrinklerEnabled) {
                Game.wrinklers.forEach(w => { if (w.phase === 2) w.hp = 0; });
            }
        }, 1000);
    }

    function formatNum(n) {
        if (n >= 1e15) return (n / 1e15).toFixed(2) + ' Qa';
        if (n >= 1e12) return (n / 1e12).toFixed(2) + ' T';
        if (n >= 1e9)  return (n / 1e9).toFixed(2) + ' G';
        if (n >= 1e6)  return (n / 1e6).toFixed(2) + ' M';
        return Math.floor(n).toLocaleString();
    }

    // ─── INTERFACE ──────────────────────────────────────────────────
    function createUI() {
        const panel = document.createElement('div');
        panel.id = 'cheat-panel';
        panel.innerHTML = `
            <div id="cheat-header">🍪 Cheat Menu v2</div>

            <div class="cheat-section stat-box">
                <span>Cookies : <b id="stat-cookies">—</b></span><br>
                <span>CpS : <b id="stat-cps">—</b></span>
            </div>

            <div class="cheat-section">
                <b>Cookies</b>
                <button onclick="CheatMod.addCookies(1e6)">+1M</button>
                <button onclick="CheatMod.addCookies(1e9)">+1G</button>
                <button onclick="CheatMod.addCookies(1e15)">+1Qa</button>
                <button onclick="CheatMod.addCookies(1e100)">+Googol</button>
                <button onclick="CheatMod.setCookies(Infinity)">Infini</button>
                <button onclick="CheatMod.resetCookies()">Reset</button>
            </div>

            <div class="cheat-section">
                <b>Auto Clicker</b>
                <button id="btn-autoclicker" onclick="CheatMod.toggleAutoClicker()">Activer</button>
                <input id="ac-speed" type="number" value="50" min="1" max="1000" style="width:50px"> ms
                <button onclick="CheatMod.updateSpeed()">OK</button>
            </div>

            <div class="cheat-section">
                <b>Auto Golden Cookie</b>
                <button id="btn-golden" onclick="CheatMod.toggleGolden()">Activer</button>
                <span style="font-size:11px;color:#aaa">Clique seul les cookies dorés</span>
            </div>

            <div class="cheat-section">
                <b>Auto Achat</b>
                <button id="btn-autobuy" onclick="CheatMod.toggleAutoBuy()">Activer</button>
                <span style="font-size:11px;color:#aaa">Achète bâtiments & amélios</span>
            </div>

            <div class="cheat-section">
                <b>Auto Sucre</b>
                <button id="btn-harvest" onclick="CheatMod.toggleHarvest()">Activer</button>
                <button onclick="CheatMod.addSugar(100)">+100 maintenant</button>
            </div>

            <div class="cheat-section">
                <b>Wrinklers</b>
                <button id="btn-wrinkler" onclick="CheatMod.toggleWrinkler()">Auto-pop</button>
                <button onclick="CheatMod.popAllWrinklers()">Pop tous</button>
            </div>

            <div class="cheat-section">
                <b>Bâtiments & Amélios</b>
                <button onclick="CheatMod.maxBuildings()">Max bâtiments</button>
                <button onclick="CheatMod.unlockUpgrades()">Tout débloquer</button>
            </div>

            <div class="cheat-section">
                <b>Prestige</b>
                <button onclick="CheatMod.addPrestige(1000)">+1000</button>
                <button onclick="CheatMod.addPrestige(1e6)">+1M</button>
            </div>

            <div class="cheat-section">
                <b>Vitesse du jeu</b>
                <button onclick="CheatMod.setSpeed(2)">x2</button>
                <button onclick="CheatMod.setSpeed(5)">x5</button>
                <button onclick="CheatMod.setSpeed(10)">x10</button>
                <button onclick="CheatMod.setSpeed(1)">Normal</button>
            </div>

            <div class="cheat-section">
                <button onclick="CheatMod.unlockAll()" style="width:100%;background:#4a0000">Tout débloquer</button>
                <button onclick="CheatMod.godMode()" style="width:100%;background:#1a005c;margin-top:4px">⚡ GOD MODE</button>
            </div>
        `;
        document.body.appendChild(panel);
        injectStyles();
    }

    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #cheat-panel {
                position: fixed;
                top: 80px;
                right: 10px;
                width: 220px;
                background: rgba(15, 8, 3, 0.95);
                border: 2px solid #a0522d;
                border-radius: 8px;
                color: #f5deb3;
                font-family: Arial, sans-serif;
                font-size: 13px;
                z-index: 99999;
                padding: 0 0 8px 0;
                box-shadow: 0 0 25px #000;
                max-height: 95vh;
                overflow-y: auto;
            }
            #cheat-header {
                background: #5c2d0e;
                text-align: center;
                padding: 8px;
                font-weight: bold;
                font-size: 15px;
                border-radius: 6px 6px 0 0;
                cursor: move;
                user-select: none;
                position: sticky;
                top: 0;
                z-index: 1;
            }
            .stat-box { background: rgba(0,0,0,0.3); font-size: 12px; }
            .cheat-section {
                padding: 5px 10px;
                border-bottom: 1px solid #2a1000;
            }
            .cheat-section b {
                display: block;
                margin-bottom: 3px;
                color: #d2a679;
                font-size: 12px;
            }
            .cheat-section button {
                display: inline-block;
                margin: 2px 2px;
                padding: 3px 7px;
                background: #5c2d0e;
                color: #f5deb3;
                border: 1px solid #a0522d;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
            }
            .cheat-section button:hover { background: #8b4513; }
            .cheat-section button.active { background: #1e5c14; border-color: #4caf50; color: #afffb0; }
            #cheat-panel input[type=number] {
                background: #2a1000;
                color: #f5deb3;
                border: 1px solid #a0522d;
                border-radius: 3px;
                padding: 2px 4px;
                vertical-align: middle;
            }
            #cheat-panel::-webkit-scrollbar { width: 5px; }
            #cheat-panel::-webkit-scrollbar-thumb { background: #5c2d0e; border-radius: 3px; }
        `;
        document.head.appendChild(style);
        makeDraggable(document.getElementById('cheat-panel'), document.getElementById('cheat-header'));
    }

    function makeDraggable(el, handle) {
        let ox = 0, oy = 0, mx = 0, my = 0;
        handle.onmousedown = (e) => {
            e.preventDefault();
            mx = e.clientX; my = e.clientY;
            document.onmousemove = (e) => {
                ox = mx - e.clientX; oy = my - e.clientY;
                mx = e.clientX; my = e.clientY;
                el.style.top = (el.offsetTop - oy) + 'px';
                el.style.right = 'auto';
                el.style.left = (el.offsetLeft - ox) + 'px';
            };
            document.onmouseup = () => {
                document.onmousemove = null;
                document.onmouseup = null;
            };
        };
    }

    function toggleBtn(id, state) {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.textContent = state ? 'Désactiver' : 'Activer';
        btn.classList.toggle('active', state);
    }

    // ─── FONCTIONS CHEAT ────────────────────────────────────────────
    window.CheatMod = {

        addCookies(amount) {
            Game.cookies += amount;
            Game.cookiesEarned += amount;
            Game.Render();
        },

        setCookies(amount) {
            Game.cookies = amount;
            Game.cookiesEarned = Math.max(Game.cookiesEarned, amount);
            Game.Render();
        },

        resetCookies() {
            Game.cookies = 0;
            Game.Render();
        },

        toggleAutoClicker() {
            autoClickerEnabled = !autoClickerEnabled;
            toggleBtn('btn-autoclicker', autoClickerEnabled);
        },

        updateSpeed() {
            const val = parseInt(document.getElementById('ac-speed').value);
            if (val < 1) return;
            autoClickerSpeed = val;
            clearInterval(autoClickerInterval);
            startAutoClicker();
        },

        toggleGolden() {
            autoGoldenEnabled = !autoGoldenEnabled;
            toggleBtn('btn-golden', autoGoldenEnabled);
        },

        toggleAutoBuy() {
            autoBuyEnabled = !autoBuyEnabled;
            toggleBtn('btn-autobuy', autoBuyEnabled);
        },

        toggleHarvest() {
            autoHarvestEnabled = !autoHarvestEnabled;
            toggleBtn('btn-harvest', autoHarvestEnabled);
        },

        toggleWrinkler() {
            autoWrinklerEnabled = !autoWrinklerEnabled;
            toggleBtn('btn-wrinkler', autoWrinklerEnabled);
        },

        popAllWrinklers() {
            Game.wrinklers.forEach(w => { if (w.phase > 0) w.hp = 0; });
        },

        maxBuildings() {
            for (const b of Game.ObjectsById) {
                if (b) { b.amount = 999; b.bought = 999; }
            }
            Game.CalculateGains();
            Game.Render();
        },

        unlockUpgrades() {
            for (const id in Game.UpgradesById) {
                const u = Game.UpgradesById[id];
                if (u) { u.unlocked = 1; u.bought = 1; }
            }
            Game.CalculateGains();
            Game.Render();
        },

        addSugar(amount) {
            Game.lumpT = Date.now() - (Game.lumpRipeAge || 0) - 1000;
            for (let i = 0; i < amount; i++) {
                if (typeof Game.gainSugarLump === 'function') Game.gainSugarLump();
                else { Game.lumps = (Game.lumps || 0) + 1; Game.lumpsTotal = (Game.lumpsTotal || 0) + 1; }
            }
            Game.Render();
        },

        addPrestige(amount) {
            Game.prestige += amount;
            Game.Render();
        },

        // Multiplie la vitesse interne du jeu
        setSpeed(mult) {
            Game.fps = 30;
            const base = 1000 / 30;
            if (this._speedInterval) clearInterval(this._speedInterval);
            if (mult === 1) {
                // Réinitialiser le loop normal
                Game.Loop = Game.Loop;
                return;
            }
            this._speedInterval = setInterval(() => {
                for (let i = 0; i < mult - 1; i++) Game.Loop();
            }, base);
        },

        unlockAll() {
            this.maxBuildings();
            this.unlockUpgrades();
            for (const id in Game.AchievementsById) {
                const a = Game.AchievementsById[id];
                if (a) a.won = 1;
            }
            Game.CalculateGains();
            Game.Render();
        },

        godMode() {
            this.setCookies(1e308);
            this.maxBuildings();
            this.unlockUpgrades();
            Game.prestige = 1e6;
            autoClickerEnabled = true;
            autoGoldenEnabled = true;
            autoWrinklerEnabled = true;
            toggleBtn('btn-autoclicker', true);
            toggleBtn('btn-golden', true);
            toggleBtn('btn-wrinkler', true);
            Game.CalculateGains();
            Game.Render();
        }
    };

})();
