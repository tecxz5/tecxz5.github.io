(function () {
    const canvas = document.getElementById('canvas');
    if (!canvas) {
        return;
    }

    if (!window.PIXI || !PIXI.utils || !PIXI.utils.isWebGLSupported()) {
        return;
    }

    const config = {
        angle: -15,
        cellSize: 40,
        fontSize: 38,
        speed: 0.4,
        colorDark: 0x8a8a8a,
        colorHover: 0x232323,
        mouseRadius: 100
    };

    const iconsList = [
        'grid_view', 'memory', 'cpu', 'router', 'dns', 'settings',
        'code', 'terminal', 'data_object', 'webhook', 'link',
        'lock', 'security', 'fingerprint', 'verified_user',
        'visibility', 'language', 'schedule', 'build', 'extension',
        'dashboard', 'integration_instructions', 'password', 'api',
        'cloud', 'storage', 'public', 'domain', 'hub',
        'bolt', 'bug_report', 'engineering', 'smart_toy', 'science',
        'rocket_launch', 'precision_manufacturing', 'model_training', 'dataset',
        'insights', 'monitoring', 'analytics', 'query_stats', 'troubleshoot',
        'lan', 'device_hub', 'devices', 'memory_alt', 'developer_board',
        'computer', 'laptop', 'phone_android', 'tablet_android', 'desktop_windows',
        'terminal', 'schema', 'token', 'key', 'vpn_key',
        'shield', 'admin_panel_settings', 'gpp_good', 'verified', 'fact_check',
        'cloud_done', 'cloud_sync', 'cloud_queue', 'backup', 'sync',
        'dns', 'http', 'language', 'travel_explore', 'explore',
        'code_blocks', 'polyline', 'account_tree', 'fork_right', 'join_full',
        'build_circle', 'extension', 'widgets', 'apps', 'tune',
        'auto_awesome', 'flare', 'stars', 'lightbulb', 'psychology',
        'assistant', 'robot_2', 'neurology', 'biotech', 'mediation',
        'psychology_alt', 'tips_and_updates', 'emoji_objects', 'architecture', 'construction',
        'handyman', 'rule', 'square_foot', 'design_services', 'brush',
        'palette', 'format_paint', 'draw', 'edit', 'edit_note',
        'terminal', 'developer_mode', 'data_thresholding', 'lan', 'settings_ethernet',
        'settings_input_antenna', 'settings_remote', 'settings_suggest', 'settings_applications', 'settings_system_daydream',
        'bluetooth', 'wifi', 'signal_cellular_alt', 'network_check', 'network_ping',
        'sensors', 'sensors_off', 'radar', 'satellite_alt', 'gps_fixed',
        'my_location', 'location_searching', 'route', 'map', 'map_search',
        'pin_drop', 'place', 'travel_explore', 'explore_off', 'near_me',
        'flight', 'directions_boat', 'directions_bus', 'directions_car', 'directions_transit',
        'electric_bolt', 'battery_charging_full', 'power', 'power_settings_new', 'offline_bolt',
        'electric_meter', 'monitor_heart', 'speed', 'timer', 'hourglass_top',
        'alarm', 'watch_later', 'today', 'event', 'event_available',
        'event_note', 'calendar_month', 'history', 'update', 'autorenew',
        'sync_alt', 'cloud_upload', 'cloud_download', 'downloading', 'upload_file',
        'download_done', 'folder', 'folder_open', 'drive_folder_upload', 'topic',
        'description', 'article', 'snippet_folder', 'request_quote', 'feed',
        'inventory_2', 'fact_check', 'check_circle', 'task_alt', 'done_all',
        'pending', 'error', 'warning', 'notification_important', 'report_problem',
        'shield_moon', 'policy', 'privacy_tip', 'lock_person', 'no_encryption',
        'encrypted', 'enhanced_encryption', 'passkey', 'key_off', 'password',
        'badge', 'verified', 'verified_user', 'how_to_reg', 'person',
        'groups', 'hub', 'share', 'ios_share', 'forward_to_inbox',
        'send', 'outbox', 'mark_email_read', 'alternate_email', 'contact_support',
        'support_agent', 'help', 'help_center', 'forum', 'chat',
        'question_answer', 'smart_button', 'ads_click', 'touch_app', 'swipe',
        'gesture', 'pan_tool', 'mouse', 'keyboard', 'keyboard_command_key',
        'keyboard_option_key', 'space_bar', 'backspace', 'subdirectory_arrow_left', 'subdirectory_arrow_right',
        'open_in_new', 'open_in_browser', 'launch', 'link_off', 'qr_code',
        'qr_code_scanner', 'document_scanner', 'scanner', 'print', 'receipt_long',
        'storefront', 'shopping_cart', 'shopping_bag', 'payments', 'account_balance_wallet',
        'credit_card', 'savings', 'trending_up', 'trending_down', 'show_chart',
        'stacked_line_chart', 'pie_chart', 'bar_chart', 'leaderboard', 'timeline',
        'monitor', 'tv', 'videocam', 'photo_camera', 'camera',
        'image', 'imagesearch_roller', 'filter_center_focus', 'crop_free', 'center_focus_strong',
        'mic', 'mic_none', 'graphic_eq', 'hearing', 'record_voice_over',
        'podcasts', 'radio', 'album', 'library_music', 'music_note',
        'movie', 'theaters', 'live_tv', 'subscriptions', 'slow_motion_video',
        'web', 'web_asset', 'html', 'javascript', 'css',
        'database', 'storage', 'table_chart', 'view_quilt', 'view_sidebar',
        'view_agenda', 'view_compact', 'view_stream', 'apps_outage', 'deployed_code',
        'terminal', 'dns', 'settings', 'api', 'integration_instructions'
    ];

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const app = new PIXI.Application({
        view: canvas,
        resizeTo: window,
        antialias: false,
        autoDensity: true,
        resolution: dpr,
        backgroundAlpha: 0,
        powerPreference: 'high-performance'
    });

    const stageRoot = new PIXI.Container();
    const gridContainer = new PIXI.Container();
    stageRoot.addChild(gridContainer);
    app.stage.addChild(stageRoot);

    const state = {
        cols: 0,
        rows: 0,
        gridWidth: 0,
        gridHeight: 0,
        offset: 0,
        cosNeg: 0,
        sinNeg: 0,
        mouseX: -9999,
        mouseY: -9999,
        mouseTX: -9999,
        mouseTY: -9999,
        pointerClientX: -9999,
        pointerClientY: -9999,
        mouseActive: false
    };
    const viewport = {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight
    };
    let viewportUpdateRaf = 0;

    const cells = [];
    const grid = [];
    const highlighted = [];
    const iconTextures = [];
    const tintLut = Array.from({ length: 256 }, (_, i) => {
        const t = i / 255;
        const eased = Math.pow(t, 0.35);
        const base = config.colorDark & 0xff;
        const hover = config.colorHover & 0xff;
        const shade = Math.floor(base + (hover - base) * eased);
        const r = shade;
        const g = shade;
        const b = shade;
        return (r << 16) | (g << 8) | b;
    });

    function updateAngleCache() {
        const rad = config.angle * Math.PI / 180;
        state.cosNeg = Math.cos(-rad);
        state.sinNeg = Math.sin(-rad);
    }

    function createIconTexture(icon) {
        const size = config.cellSize;
        const el = document.createElement('canvas');
        el.width = size;
        el.height = size;
        const iconCtx = el.getContext('2d');
        iconCtx.clearRect(0, 0, size, size);
        iconCtx.font = `${config.fontSize}px "Material Icons"`;
        iconCtx.fillStyle = '#ffffff';
        iconCtx.textAlign = 'center';
        iconCtx.textBaseline = 'middle';
        iconCtx.fillText(icon, size / 2, size / 2 + 1);
        return PIXI.Texture.from(el);
    }

    function ensureTextures() {
        if (iconTextures.length > 0) {
            return;
        }

        for (let i = 0; i < iconsList.length; i++) {
            iconTextures.push(createIconTexture(iconsList[i]));
        }
    }

    function clearGrid() {
        for (let i = 0; i < cells.length; i++) {
            gridContainer.removeChild(cells[i].sprite);
        }
        cells.length = 0;
        grid.length = 0;
        highlighted.length = 0;
    }

    function updateViewport() {
        const rect = canvas.getBoundingClientRect();
        viewport.left = rect.left;
        viewport.top = rect.top;
        viewport.width = rect.width || window.innerWidth;
        viewport.height = rect.height || window.innerHeight;
    }

    function updateMouseTargetFromClient(clientX, clientY) {
        state.mouseTX = clientX - viewport.left;
        state.mouseTY = clientY - viewport.top;
    }

    function scheduleViewportUpdate() {
        if (viewportUpdateRaf) {
            return;
        }

        viewportUpdateRaf = requestAnimationFrame(() => {
            viewportUpdateRaf = 0;
            updateViewport();
            if (state.mouseActive) {
                updateMouseTargetFromClient(state.pointerClientX, state.pointerClientY);
            }
        });
    }

    function rebuildGrid() {
        clearGrid();
        updateAngleCache();
        updateViewport();

        const w = viewport.width;
        const h = viewport.height;
        const diag = Math.sqrt(w * w + h * h);
        state.cols = Math.ceil(diag / config.cellSize) + 4;
        state.rows = Math.ceil(diag / config.cellSize) + 4;
        state.gridWidth = state.cols * config.cellSize;
        state.gridHeight = state.rows * config.cellSize;

        stageRoot.x = w / 2;
        stageRoot.y = h / 2;
        stageRoot.rotation = config.angle * Math.PI / 180;
        gridContainer.x = -state.gridWidth / 2;
        gridContainer.y = -state.gridHeight / 2;

        for (let c = 0; c < state.cols; c++) {
            grid[c] = [];
            const x = c * config.cellSize + config.cellSize / 2;

            for (let r = 0; r < state.rows; r++) {
                const textureIndex = (Math.random() * iconTextures.length) | 0;
                const sprite = new PIXI.Sprite(iconTextures[textureIndex]);
                const baseY = r * config.cellSize + config.cellSize / 2;

                sprite.anchor.set(0.5);
                sprite.x = x;
                sprite.y = baseY;
                sprite.tint = config.colorDark;

                gridContainer.addChild(sprite);

                const cell = {
                    c,
                    r,
                    x,
                    baseY,
                    sprite
                };
                cells.push(cell);
                grid[c][r] = cell;
            }
        }
    }

    function rotateMouse(mx, my) {
        const cx = viewport.width / 2;
        const cy = viewport.height / 2;
        const dx = mx - cx;
        const dy = my - cy;
        const rx = dx * state.cosNeg - dy * state.sinNeg;
        const ry = dx * state.sinNeg + dy * state.cosNeg;
        return { x: rx, y: ry };
    }

    function updateCellPositions(scroll) {
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            cell.sprite.y = (cell.baseY + scroll) % state.gridHeight;
        }
    }

    function resetHighlightedCells() {
        while (highlighted.length) {
            const cell = highlighted.pop();
            cell.sprite.tint = config.colorDark;
        }
    }

    function highlightCells(mX, mY, scroll) {
        const radius = config.mouseRadius;
        const radius2 = radius * radius;
        const cellSize = config.cellSize;
        const rowRadius = Math.ceil(radius / cellSize);
        const iMin = Math.max(0, Math.floor((mX - radius) / cellSize));
        const iMax = Math.min(state.cols - 1, Math.ceil((mX + radius) / cellSize));
        const baseMY = (mY - scroll + state.gridHeight) % state.gridHeight;
        const centerRow = Math.floor((baseMY - cellSize / 2) / cellSize);

        for (let c = iMin; c <= iMax; c++) {
            const x = c * cellSize + cellSize / 2;
            const dx = x - mX;
            const dx2 = dx * dx;

            if (dx2 > radius2) {
                continue;
            }

            for (let dr = -rowRadius; dr <= rowRadius; dr++) {
                const r = ((centerRow + dr) % state.rows + state.rows) % state.rows;
                const cell = grid[c][r];
                const yBase = cell.baseY;
                const dyRaw = Math.abs(yBase - baseMY);
                const dy = Math.min(dyRaw, state.gridHeight - dyRaw);
                const dist2 = dx2 + dy * dy;

                if (dist2 >= radius2) {
                    continue;
                }

                const intensity = 1 - Math.sqrt(dist2) / radius;
                const lutIdx = Math.max(0, Math.min(255, (intensity * 255) | 0));
                cell.sprite.tint = tintLut[lutIdx];
                highlighted.push(cell);
            }
        }
    }

    function tick(delta) {
        const lerp = state.mouseActive ? 0.2 : 0.08;
        state.mouseX += (state.mouseTX - state.mouseX) * lerp;
        state.mouseY += (state.mouseTY - state.mouseY) * lerp;

        state.offset += config.speed * delta;
        const scroll = state.offset % state.gridHeight;
        updateCellPositions(scroll);

        resetHighlightedCells();
        const hasPointer = state.pointerClientX > -9000 && state.pointerClientY > -9000;
        if (hasPointer) {
            const rotated = rotateMouse(state.mouseX, state.mouseY);
            const mX = rotated.x + state.gridWidth / 2;
            const mY = rotated.y + state.gridHeight / 2;
            highlightCells(mX, mY, scroll);
        }
    }

    function onPointerMove(e) {
        state.pointerClientX = e.clientX;
        state.pointerClientY = e.clientY;
        updateMouseTargetFromClient(e.clientX, e.clientY);
        state.mouseActive = true;
    }

    function onPointerLeave() {
        state.mouseActive = false;
        state.pointerClientX = -9999;
        state.pointerClientY = -9999;
        state.mouseTX = -9999;
        state.mouseTY = -9999;
    }

    function setupEvents() {
        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('pointerover', onPointerMove, { passive: true });
        window.addEventListener('pointerdown', onPointerMove, { passive: true });
        window.addEventListener('pointerleave', onPointerLeave, { passive: true });
        window.addEventListener('pointercancel', onPointerLeave, { passive: true });
        window.addEventListener('resize', rebuildGrid);
        window.addEventListener('scroll', scheduleViewportUpdate, { passive: true });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                app.ticker.stop();
            } else {
                app.ticker.start();
                scheduleViewportUpdate();
            }
        });
    }

    document.fonts.load(`${config.fontSize}px "Material Icons"`).then(() => {
        ensureTextures();
        rebuildGrid();
        setupEvents();
        app.ticker.add(tick);
    });
})();
