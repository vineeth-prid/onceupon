// Admin Dashboard Interactivity

document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation / Tab System
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');

    function switchView(viewId) {
        // Update Sidebar Active State
        navItems.forEach(item => {
            if (item.dataset.view === viewId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update Tab Visibility
        tabContents.forEach(tab => {
            if (tab.id === `view-${viewId}`) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = item.dataset.view;
            if (viewId) {
                switchView(viewId);
            }
        });
    });

    // 2. Toast Notification System
    const toastContainer = document.getElementById('toast-container');

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'check-circle';
        if (type === 'info') icon = 'info';
        if (type === 'error') icon = 'alert-circle';

        toast.innerHTML = `
            <i data-lucide="${icon}" class="icon"></i>
            <span>${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        if (window.lucide) lucide.createIcons();

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // 3. Button Actions
    const actionButtons = document.querySelectorAll('[data-action]');
    
    const actionMessages = {
        'update-api': 'API Configuration updated successfully!',
        'save-model': 'Configuration saved successfully',
        'save-budget': 'Monthly budget cap updated!',
        'update-stripe': 'Stripe gateway updated to Live mode',
        'save-price': 'Pricing updated',
        'create-coupon': 'New coupon generated',
        'send-notification': 'Notification broadcast sent to selected audience',
        'manage-users': 'User management panel loaded',
        'check-api': 'System health check: All APIs online',
        'view-payments': 'Payment dashboard updated',
        'export-csv': 'User data exported to CSV successfully',
        'export-logs': 'Audit logs exported to Excel successfully'
    };

    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.dataset.action;
            const originalHTML = button.innerHTML;
            
            // Visual feedback
            const isSidebarItem = button.classList.contains('btn-action-item');
            
            if (isSidebarItem) {
                const icon = button.querySelector('i')?.outerHTML || '';
                button.innerHTML = `${icon} Processing...`;
            } else {
                button.textContent = 'Processing...';
            }
            
            button.disabled = true;

            setTimeout(() => {
                if (isSidebarItem) {
                    const icon = button.querySelector('i')?.outerHTML || '';
                    button.innerHTML = `${icon} Success!`;
                } else {
                    button.textContent = 'Success!';
                }
                
                showToast(actionMessages[action] || 'Action completed successfully');
                
                if (action === 'manage-users') switchView('users');
                
                setTimeout(() => {
                    button.innerHTML = originalHTML;
                    button.disabled = false;
                }, 1500);
            }, 800);
        });
    });

    // 4. Toggle Switch Interactivity
    const toggleSwitches = document.querySelectorAll('.switch input');
    toggleSwitches.forEach(toggle => {
        toggle.addEventListener('change', () => {
            const label = toggle.closest('.trigger-item')?.querySelector('h4')?.textContent || 'Setting';
            const status = toggle.checked ? 'enabled' : 'disabled';
            showToast(`${label} has been ${status}`, 'info');
        });
    });

    // 5. Create Book Button in Top Bar
    const createBtn = document.querySelector('.btn-create');
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            showToast('Opening Book Creation Wizard...', 'info');
        });
    }

    // 6. Table Search Mockup
    const searchInputs = document.querySelectorAll('.search-wrapper input');
    searchInputs.forEach(input => {
        input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                showToast(`Searching for "${input.value}"...`, 'info');
            }
        });
    });
});
