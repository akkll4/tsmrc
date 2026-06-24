

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = mobileMenuBtn.querySelector('i');
    if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuBtn.querySelector('i').classList.remove('fa-times');
        mobileMenuBtn.querySelector('i').classList.add('fa-bars');
    });
});

// Navbar Scroll Effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Day Tabs Filtering
const dayTabs = document.querySelectorAll('.day-tab');
const agendaDays = document.querySelectorAll('.agenda-day');

dayTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetDay = tab.getAttribute('data-day');
        
        // Update active tab
        dayTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Filter days
        agendaDays.forEach(day => {
            if (targetDay === 'all') {
                day.classList.remove('hidden');
            } else if (day.getAttribute('data-day') === targetDay) {
                day.classList.remove('hidden');
            } else {
                day.classList.add('hidden');
            }
        });
        
        // Scroll to agenda content
        document.querySelector('.agenda-content').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // Update filter tags
        updateFilterTags();
    });
});

// Track Filter
const trackFilter = document.getElementById('trackFilter');
trackFilter.addEventListener('change', filterSessions);

// Type Filter
const typeFilter = document.getElementById('typeFilter');
typeFilter.addEventListener('change', filterSessions);

// Search Functionality
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', filterSessions);

// Clear Search Button
const clearSearch = document.getElementById('clearSearch');
clearSearch.addEventListener('click', () => {
    searchInput.value = '';
    filterSessions();
});

// Filter Sessions Function
function filterSessions() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const trackValue = trackFilter.value;
    const typeValue = typeFilter.value;
    const activeDayTab = document.querySelector('.day-tab.active');
    const activeDay = activeDayTab ? activeDayTab.getAttribute('data-day') : 'all';
    
    let visibleCount = 0;
    const sessionCards = document.querySelectorAll('.session-card');
    const sessionTracks = document.querySelectorAll('.session-track');
    const agendaDays = document.querySelectorAll('.agenda-day');
    
    // First filter by day
    agendaDays.forEach(day => {
        if (activeDay === 'all') {
            day.classList.remove('hidden');
        } else if (day.getAttribute('data-day') === activeDay) {
            day.classList.remove('hidden');
        } else {
            day.classList.add('hidden');
        }
    });
    
    // Then filter sessions
    sessionCards.forEach(card => {
        const track = card.getAttribute('data-track');
        const type = card.getAttribute('data-type');
        const title = card.querySelector('.session-title').textContent.toLowerCase();
        const presenter = card.querySelector('.session-presenter').textContent.toLowerCase();
        const parentDay = card.closest('.agenda-day');
        
        // Check if parent day is visible
        const isDayVisible = parentDay && !parentDay.classList.contains('hidden');
        
        // Check all filter conditions
        const matchesSearch = searchTerm === '' || 
                            title.includes(searchTerm) || 
                            presenter.includes(searchTerm);
        const matchesTrack = trackValue === 'all' || track === trackValue;
        const matchesType = typeValue === 'all' || type === typeValue;
        
        if (isDayVisible && matchesSearch && matchesTrack && matchesType) {
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.classList.add('hidden');
        }
    });
    
    // Hide empty tracks
    sessionTracks.forEach(track => {
        const visibleSessions = track.querySelectorAll('.session-card:not(.hidden)');
        if (visibleSessions.length === 0) {
            track.style.display = 'none';
        } else {
            track.style.display = 'block';
        }
    });
    
    // Show/Hide no results message
    const noResults = document.getElementById('noResults');
    if (visibleCount === 0) {
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
    }
    
    // Update active filters display
    updateFilterTags();
}

// Update Filter Tags
function updateFilterTags() {
    const activeFilters = document.getElementById('activeFilters');
    const filterTags = document.getElementById('filterTags');
    const searchTerm = searchInput.value.toLowerCase().trim();
    const trackValue = trackFilter.value;
    const typeValue = typeFilter.value;
    const activeDayTab = document.querySelector('.day-tab.active');
    const activeDay = activeDayTab ? activeDayTab.getAttribute('data-day') : 'all';
    
    let hasFilters = false;
    let tagsHTML = '';
    
    if (activeDay !== 'all') {
        hasFilters = true;
        const dayNames = {
            'workshop': 'Workshop Day',
            'day1': 'Day 1',
            'day2': 'Day 2'
        };
        tagsHTML += `
            <div class="filter-tag">
                <span>${dayNames[activeDay]}</span>
                <button onclick="resetDayFilter()"><i class="fas fa-times"></i></button>
            </div>
        `;
    }
    
    if (trackValue !== 'all') {
        hasFilters = true;
        tagsHTML += `
            <div class="filter-tag">
                <span>${trackValue.replace('-', ' ').toUpperCase()}</span>
                <button onclick="resetTrackFilter()"><i class="fas fa-times"></i></button>
            </div>
        `;
    }
    
    if (typeValue !== 'all') {
        hasFilters = true;
        tagsHTML += `
            <div class="filter-tag">
                <span>${typeValue.replace('-', ' ').toUpperCase()}</span>
                <button onclick="resetTypeFilter()"><i class="fas fa-times"></i></button>
            </div>
        `;
    }
    
    if (searchTerm !== '') {
        hasFilters = true;
        tagsHTML += `
            <div class="filter-tag">
                <span>Search: "${searchTerm}"</span>
                <button onclick="resetSearch()"><i class="fas fa-times"></i></button>
            </div>
        `;
    }
    
    filterTags.innerHTML = tagsHTML;
    activeFilters.style.display = hasFilters ? 'flex' : 'none';
}

// Reset Functions
function resetDayFilter() {
    dayTabs.forEach(tab => tab.classList.remove('active'));
    document.querySelector('.day-tab[data-day="all"]').classList.add('active');
    filterSessions();
}

function resetTrackFilter() {
    trackFilter.value = 'all';
    filterSessions();
}

function resetTypeFilter() {
    typeFilter.value = 'all';
    filterSessions();
}

function resetSearch() {
    searchInput.value = '';
    filterSessions();
}

// Clear All Filters
const clearFilters = document.getElementById('clearFilters');
clearFilters.addEventListener('click', () => {
    resetDayFilter();
    resetTrackFilter();
    resetTypeFilter();
    resetSearch();
});

// Session Detail Modal
const sessionModal = document.getElementById('sessionModal');
const modalClose = document.getElementById('modalClose');

function showSessionDetail(button) {
    const card = button.closest('.session-card');
    const badge = card.querySelector('.session-badge');
    const title = card.querySelector('.session-title');
    const time = card.querySelector('.session-time span');
    const presenter = card.querySelector('.session-presenter');
    const description = card.querySelector('.session-description');
    
    // Get parent day info
    const parentDay = card.closest('.agenda-day');
    const dayDate = parentDay ? parentDay.querySelector('.day-date-display span') : null;
    const dayLocation = parentDay ? parentDay.querySelector('.day-location span') : null;
    
    // Populate modal
    document.getElementById('modalBadge').textContent = badge.textContent;
    document.getElementById('modalBadge').className = 'modal-badge ' + badge.classList[1];
    document.getElementById('modalBadge').style.background = getComputedStyle(badge).background;
    document.getElementById('modalTitle').textContent = title.textContent;
    document.getElementById('modalTime').textContent = time.textContent;
    document.getElementById('modalDate').textContent = dayDate ? dayDate.textContent : 'TBD';
    document.getElementById('modalLocation').textContent = dayLocation ? dayLocation.textContent : 'TBD';
    document.getElementById('modalPresenter').textContent = presenter.textContent.trim();
    document.getElementById('modalDescription').textContent = description ? description.textContent : 'Detailed session information will be available soon.';
    
    // Show modal
    sessionModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close Modal
modalClose.addEventListener('click', () => {
    sessionModal.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// Close modal when clicking outside
sessionModal.addEventListener('click', (e) => {
    if (e.target === sessionModal) {
        sessionModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sessionModal.classList.contains('active')) {
        sessionModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Add to Calendar Functionality
document.querySelectorAll('.btn-add-calendar, .btn-add-calendar-modal').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        const card = this.closest('.session-card');
        const title = card ? card.querySelector('.session-title').textContent : document.getElementById('modalTitle').textContent;
        const time = card ? card.querySelector('.session-time span').textContent : document.getElementById('modalTime').textContent;
        
        // Create calendar event (simplified - in production use Google Calendar API)
        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=20240905T150000Z/20240905T160000Z&details=${encodeURIComponent('TSMRC 2026 Conference Session')}`;
        
        window.open(calendarUrl, '_blank');
        
        // Show success message
        showToast('Session added to calendar!', 'success');
    });
});

// Share Session Functionality
document.querySelectorAll('.btn-share-session').forEach(btn => {
    btn.addEventListener('click', function() {
        const title = document.getElementById('modalTitle').textContent;
        const url = window.location.href;
        
        if (navigator.share) {
            navigator.share({
                title: 'TSMRC 2026 Session',
                text: title,
                url: url
            }).catch(console.error);
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(`${title}\n${url}`);
            showToast('Link copied to clipboard!', 'success');
        }
    });
});

// Download PDF Functionality
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
downloadPdfBtn.addEventListener('click', () => {
    // In production, this would link to actual PDF file
    showToast('PDF download started!', 'success');
    
    // Simulate download
    setTimeout(() => {
        // window.open('assets/TSMRC2026_Agenda.pdf', '_blank');
        alert('PDF download feature will be available soon. The actual PDF file will be generated from the agenda data.');
    }, 1000);
});

// Toast Notification Function
function showToast(message, type = 'success') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: ${type === 'success' ? 'var(--success)' : 'var(--error)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 600;
        box-shadow: var(--shadow-xl);
        z-index: 10001;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add toast animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Smooth Scroll for Internal Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe session cards for animation
document.querySelectorAll('.session-card, .track-header, .day-header').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Print Functionality
const printBtn = document.createElement('button');
printBtn.className = 'btn-download-pdf';
printBtn.innerHTML = '<i class="fas fa-print"></i><span>Print Agenda</span>';
printBtn.style.marginLeft = '0.5rem';
printBtn.addEventListener('click', () => {
    window.print();
});
downloadPdfBtn.parentNode.appendChild(printBtn);

// Local Storage for Last Viewed Day
const lastViewedDay = localStorage.getItem('tsmrc_lastDay');
if (lastViewedDay && lastViewedDay !== 'all') {
    const targetTab = document.querySelector(`.day-tab[data-day="${lastViewedDay}"]`);
    if (targetTab) {
        targetTab.click();
    }
}

// Save last viewed day
dayTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const day = tab.getAttribute('data-day');
        localStorage.setItem('tsmrc_lastDay', day);
    });
});

// Page Load Animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Console Log for Debugging
console.log('📋 TSMRC 2026 - Agenda Page Loaded Successfully!');
console.log('🎯 Features: Day filtering, Track filtering, Search, Session details, Calendar integration');