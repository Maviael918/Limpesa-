// status-console.js - Indicador visual para operações com Supabase

(function() {
    const MAX_LOG_ENTRIES = 8;
    const STATUS_LABELS = {
        online: 'Online',
        offline: 'Offline',
        syncing: 'Online',
        degraded: 'Instável'
    };

    let initialized = false;
    let statusState = 'offline';

    let container;
    let indicator;
    let statusText;
    let statusDetail;
    let statusLog;
    let toggleButton;

    function queryElements() {
        container = document.getElementById('status-console');
        indicator = document.getElementById('supabase-status-indicator');
        statusText = document.getElementById('supabase-status-text');
        statusDetail = document.getElementById('supabase-status-detail');
        statusLog = document.getElementById('status-log');
        toggleButton = document.getElementById('status-console-toggle');
        return container && indicator && statusText && statusDetail && statusLog && toggleButton;
    }

    function toggleExpanded() {
        if (!container || !toggleButton) return;
        const willExpand = !container.classList.contains('is-expanded');
        container.classList.toggle('is-expanded', willExpand);
        toggleButton.setAttribute('aria-expanded', willExpand ? 'true' : 'false');
    }

    function ensureInitialized() {
        if (initialized) return true;
        if (!queryElements()) return false;
        initialized = true;
        toggleButton.addEventListener('click', toggleExpanded);
        setConnection('offline', 'Aguardando Supabase');
        return true;
    }

    function formatLabel(state) {
        return STATUS_LABELS[state] || 'Desconhecido';
    }

    function timestamp() {
        try {
            return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        } catch (e) {
            return new Date().toLocaleTimeString();
        }
    }

    function setConnection(state, detailMessage) {
        if (!ensureInitialized()) return;
        statusState = state;
        indicator.classList.remove('is-online', 'is-offline', 'is-syncing', 'is-degraded');
        indicator.classList.add(`is-${state}`);
        statusText.textContent = formatLabel(state);
        if (detailMessage) {
            statusDetail.textContent = detailMessage;
        }
    }

    function log(message, type = 'info') {
        if (!ensureInitialized()) return;
        const li = document.createElement('li');
        li.className = `status-log-item ${type}`;

        const timeSpan = document.createElement('span');
        timeSpan.className = 'status-log-time';
        timeSpan.textContent = timestamp();

        const msgSpan = document.createElement('span');
        msgSpan.className = 'status-log-message';
        msgSpan.textContent = message;

        li.appendChild(timeSpan);
        li.appendChild(msgSpan);
        statusLog.prepend(li);

        while (statusLog.childElementCount > MAX_LOG_ENTRIES) {
            statusLog.removeChild(statusLog.lastChild);
        }

        statusDetail.textContent = message;
    }

    function setSyncing(detailMessage) {
        const message = detailMessage || 'Sincronizando com o Supabase...';
        setConnection('syncing', message);
    }

    function ensureReadyLater() {
        if (initialized) return;
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', ensureInitialized, { once: true });
        } else {
            ensureInitialized();
        }
    }

    ensureReadyLater();

    window.StatusConsole = {
        init: ensureInitialized,
        setConnection,
        setSyncing,
        log
    };
})();
