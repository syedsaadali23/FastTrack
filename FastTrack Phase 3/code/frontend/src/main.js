import './style.css'

// The logo URL
const LOGO_URL = "https://upload.wikimedia.org/wikipedia/en/thumb/e/e4/National_University_of_Computer_and_Emerging_Sciences_logo.png/250px-National_University_of_Computer_and_Emerging_Sciences_logo.png";

// HTML Templates for Login and Register states
const loginTemplate = `
  <div class="card">
    <div class="header">
      <img src="${LOGO_URL}" alt="FastTrack Logo" class="logo" />
      <h1>FastTrack</h1>
      <p class="subtitle">Sign in to your account</p>
    </div>
    
    <form id="login-form">
      <div class="form-group">
        <label>Username</label>
        <input type="text" id="username" required />
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" id="password" required />
      </div>
      <button type="submit" class="button">Sign In</button>
      <div id="msg" class="message"></div>
    </form>
    
    <div class="toggle-link">
      Don't have an account? <a id="go-register">Create Account</a>
    </div>
  </div>
`;

const registerTemplate = `
  <div class="card" style="padding: 32px">
    <div class="header" style="margin-bottom: 24px">
      <h1>Create Account</h1>
      <p class="subtitle">Join FastTrack today</p>
    </div>

    <div class="tabs">
      <div class="tab active" data-role="PLAYER">Player</div>
      <div class="tab" data-role="ORGANIZER">Organizer</div>
    </div>
    
    <form id="register-form">
      <div class="form-group">
        <label>Full Name</label>
        <input type="text" id="reg-name" required />
      </div>
      <div class="form-group">
        <label>Username</label>
        <input type="text" id="reg-username" required />
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" id="reg-password" required minlength="8" />
      </div>
      <div class="form-group">
        <label>Re-enter Password</label>
        <input type="password" id="reg-password-confirm" required minlength="8" />
      </div>
      
      <!-- Player Specific Field -->
      <div class="form-group" id="field-roll">
        <label>Roll Number</label>
        <input type="text" id="reg-roll" />
      </div>

      <!-- Organizer Specific Field -->
      <div class="form-group hidden" id="field-code">
        <label>Admin Issued Code</label>
        <input type="password" id="reg-code" />
      </div>

      <button type="submit" class="button">Register</button>
      <div id="reg-msg" class="message"></div>
    </form>
    
    <div class="toggle-link">
      Already have an account? <a id="go-login">Sign In</a>
    </div>
  </div>
`;

const dashboardTemplate = `
  <div class="dashboard-layout">
    <!-- Sidebar -->
    <div class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <h2 class="sidebar-title">FastTrack</h2>
        <button class="toggle-btn" id="toggle-sidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        </button>
      </div>
      <div class="menu-item active" id="menu-profile">
        <div class="menu-item-text">Manage Profile</div>
      </div>
      <div class="menu-item" id="menu-events">
        <div class="menu-item-text">Browse Events</div>
      </div>
      <div class="menu-item" id="menu-my-registrations" style="display:none;">
        <div class="menu-item-text">My Registrations</div>
      </div>
      <div class="menu-item" id="menu-create-team" style="display:none;">
        <div class="menu-item-text">Create Team</div>
      </div>
      <div class="menu-item" id="menu-my-teams" style="display:none;">
        <div class="menu-item-text">My Teams</div>
      </div>
      <div style="flex:1"></div>
      <div class="menu-item" id="logout-btn">
        <div class="menu-item-text">Sign Out</div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="dashboard-content" style="position:relative; margin-top:20px;">
      <div id="global-search-container" style="position: fixed; top: 25px; left: 50%; transform: translateX(-50%); width: 100%; max-width: 500px; z-index: 999; padding: 0 20px; box-sizing: border-box;">
         <input type="text" id="global-search-input" placeholder="Search profiles, teams, events..." style="width:100%; padding:10px 16px; border:1px solid var(--border); border-radius:24px; outline:none; box-shadow: 0 4px 6px rgba(0,0,0,0.05); font-size:14px; background:white;" />
      </div>

      <div class="topbar" style="display:flex; justify-content:flex-end; align-items:center; min-height:40px;">
        <div class="bell-container" id="bell-btn-top">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          <div class="unread-badge hidden" id="bell-badge"></div>
        </div>
      </div>
      <div id="section-profile">
        <div class="profile-card">
          <div class="profile-header">
          <div class="profile-img-container">
            <img class="profile-img hidden" id="profile-pic-display" src="" alt="Profile"/>
            <div class="profile-img-placeholder" id="profile-pic-placeholder"></div>
          </div>
          <div>
            <h2 id="profile-name-display">Loading...</h2>
            <p class="subtitle" id="profile-role-display"></p>
            <div class="profile-actions">
              <label class="btn-secondary" style="display:inline-block; font-weight:normal;">
                Upload Picture
                <input type="file" id="upload-pic" accept="image/*" class="hidden">
              </label>
              <button class="btn-danger" id="delete-pic">Remove</button>
            </div>
          </div>
        </div>

        <!-- Change Username -->
        <h3 class="section-title">Change Username</h3>
        <form id="form-change-username">
          <div class="form-group">
            <label>New Username</label>
            <input type="text" id="update-username" required />
          </div>
          <button type="submit" class="btn-secondary">Update Username</button>
          <div id="username-msg" class="message"></div>
        </form>

        <!-- Change Password -->
        <h3 class="section-title">Change Password</h3>
        <form id="form-change-password">
          <div class="form-group">
            <label>Current Password</label>
            <input type="password" id="update-pass-old" required />
          </div>
          <div class="form-group">
            <label>New Password</label>
            <input type="password" id="update-pass-new1" required minlength="8" />
          </div>
          <div class="form-group">
            <label>Confirm New Password</label>
            <input type="password" id="update-pass-new2" required minlength="8" />
          </div>
          <button type="submit" class="btn-secondary">Update Password</button>
          <div id="password-msg" class="message"></div>
        </form>

        <!-- Danger Zone (hidden for admin) -->
        <div id="danger-zone-container" class="hidden">
          <h3 class="section-title text-danger">Danger Zone</h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">Proceeding will permanently erase all data associated with this account.</p>
          <button class="btn-danger" id="btn-show-delete-modal">Delete Account</button>
        </div>
      </div>
      </div>

      <div id="section-events" class="hidden">
        <h2 style="margin-bottom: 20px; color: var(--text-main);">Browse Events</h2>
        <div id="events-grid" class="events-grid"></div>
        <button id="btn-create-event-fab" class="fab hidden">+</button>
      </div>
      <div id="section-my-registrations" class="hidden">
        <h2 style="margin-bottom: 20px; color: var(--text-main);">My Registrations</h2>
        <div id="my-registrations-grid" class="events-grid"></div>
        <div id="my-regs-msg" class="message hidden"></div>
      </div>
      <div id="section-my-teams" class="hidden">
        <h2 style="margin-bottom: 20px; color: var(--text-main);">My Teams</h2>
        <div id="my-teams-grid" class="events-grid"></div>
        <div id="my-teams-msg" class="message hidden"></div>
      </div>
      <div id="section-create-team" class="hidden">
        <h2 style="margin-bottom: 20px; color: var(--text-main);">Create a Team</h2>
        <div class="profile-card" style="max-width: 500px; margin: 0 auto;">
          <form id="form-create-team">
            <div class="form-group">
              <label>Team Name (Unique)</label>
              <input type="text" id="team-name" required />
            </div>
            <div class="form-group">
              <label>Select Event Sport</label>
              <select id="team-sport" required style="width:100%; border:1px solid var(--border); padding:8px; border-radius:8px;"></select>
            </div>
            <div class="form-group">
              <label>Open to Join Requests?</label>
              <select id="team-open" style="width:100%; border:1px solid var(--border); padding:8px; border-radius:8px;">
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div class="form-group">
              <label>Team Logo (Optional)</label>
              <input type="file" id="team-logo" accept="image/*" />
            </div>
            <button type="submit" class="btn-secondary" style="width:100%;">Create Team</button>
            <div id="team-msg" class="message"></div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Search Modal -->
  <div id="search-modal" class="modal-overlay hidden" style="z-index: 1005;">
    <div class="modal-content" style="max-width: 800px; width: 90%; max-height:85vh; display:flex; flex-direction:column;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
        <h2 style="margin:0;">Search Results</h2>
        <div style="display:flex; gap:10px;">
           <button id="btn-search-filters" class="btn-secondary" style="padding:6px 12px; font-size:12px;">Filters</button>
           <button class="close-btn" id="btn-close-search">×</button>
        </div>
      </div>
      
      <!-- Filter Drawer inside Modal -->
      <div id="search-filter-drawer" class="hidden" style="background:var(--bg-secondary); padding:15px; border-radius:8px; margin-bottom:15px;">
         <h4 style="margin-top:0; margin-bottom:10px;">Apply Filters</h4>
         <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <div class="form-group" style="flex:1; min-width:150px;">
               <label>Sport</label>
               <input type="text" id="sf-sport" placeholder="e.g. Cricket" />
            </div>
            <div class="form-group" style="flex:1; min-width:150px; display:flex; align-items:flex-end;">
               <label style="display:flex; align-items:center; gap:8px; cursor:pointer; height:38px;">
                 <input type="checkbox" id="sf-open-reg" /> Open Registration
               </label>
            </div>
            <div class="form-group" style="flex:1; min-width:150px; display:flex; align-items:flex-end;">
               <label style="display:flex; align-items:center; gap:8px; cursor:pointer; height:38px;">
                 <input type="checkbox" id="sf-open-req" /> Open Join Requests
               </label>
            </div>
         </div>
         <button class="btn-secondary" id="btn-apply-filters" style="width:100%; margin-top:10px;">Apply Filters & Re-search</button>
      </div>
      
      <div style="overflow-y:auto; flex:1;" id="search-scroll-area">
          <h3 class="section-title">Profiles</h3>
          <div id="sr-profiles" class="events-grid" style="margin-bottom:20px;"></div>
          
          <h3 class="section-title">Teams</h3>
          <div id="sr-teams" class="events-grid" style="margin-bottom:20px;"></div>
          
          <h3 class="section-title">Events</h3>
          <div id="sr-events" class="events-grid"></div>
      </div>
    </div>
  </div>

  <!-- Create Event Modal -->
  <div id="create-event-modal" class="modal-overlay hidden" style="z-index: 1001;">
    <div class="modal-content" style="max-width: 450px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
        <h3 style="margin:0; color:var(--text-main);">Create Event</h3>
        <button class="close-btn" id="btn-close-event-modal">×</button>
      </div>
      <div class="form-group">
        <label>Event Name</label>
        <input type="text" id="ev-name" required />
      </div>
      <div style="display:flex; gap:10px;">
        <div class="form-group" style="flex:1;">
          <label>Sport</label>
          <input type="text" id="ev-sport" required />
        </div>
        <div class="form-group" style="flex:1;">
          <label>Tournament Type</label>
          <select id="ev-tournament" style="width:100%; border:1px solid var(--border); padding:8px; border-radius:8px;">
            <option value="">None / N/A</option>
            <option value="Knockout">Knockout</option>
            <option value="Round Robin">Round Robin</option>
            <option value="Group Stage">Group Stage</option>
          </select>
        </div>
      </div>
      <div style="display:flex; gap:10px;">
        <div class="form-group" style="flex:1;">
          <label>Is Team Sport?</label>
          <select id="ev-team" style="width:100%; border:1px solid var(--border); padding:8px; border-radius:8px;">
            <option value="false">No (Individual)</option>
            <option value="true">Yes</option>
          </select>
        </div>
        <div class="form-group" style="flex:1;">
          <label>Duration</label>
          <input type="text" id="ev-duration" placeholder="e.g. 2 Days" />
        </div>
      </div>
      <div style="display:flex; gap:10px;">
        <div class="form-group" style="flex:1;">
          <label>Start Date</label>
          <input type="date" id="ev-start" />
        </div>
        <div class="form-group" style="flex:1;">
          <label>End Date</label>
          <input type="date" id="ev-end" />
        </div>
      </div>
      <div style="display:flex; gap:10px;">
        <div class="form-group" style="flex:1;">
          <label>Total Slots</label>
          <input type="number" id="ev-total" min="1" placeholder="e.g. 100" />
        </div>
        <div class="form-group" style="flex:1;">
          <label>Reg. Fee (PKR)</label>
          <input type="number" id="ev-fee" min="0" step="0.01" />
        </div>
      </div>
      <div style="display:flex; gap:10px;" id="ev-team-params" class="hidden">
        <div class="form-group" style="flex:1;">
          <label>Team Cap</label>
          <input type="number" id="ev-cap" placeholder="Max" min="1" />
        </div>
        <div class="form-group" style="flex:1;">
          <label>Min Required</label>
          <input type="number" id="ev-min" placeholder="Min" min="1" />
        </div>
      </div>
      <div class="form-group">
        <label>Event Picture (Optional)</label>
        <input type="file" id="ev-pic" accept="image/*" />
      </div>
      <button class="btn-secondary" id="btn-submit-event" style="width:100%; background:var(--primary); color:white; border:none; padding:12px; font-weight:600;">Create Event</button>
    </div>
  </div>

  <!-- Event Details Modal -->
  <div id="event-details-modal" class="modal-overlay hidden" style="z-index: 10060;">
    <div class="modal-content" style="max-width: 500px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
        <h3 style="margin:0; color:var(--text-main);" id="det-name">Event Details</h3>
        <button class="close-btn" id="btn-close-details">×</button>
      </div>
      <img id="det-img" src="" style="width:100%; height:200px; object-fit:cover; border-radius:8px; margin-bottom:16px;" />
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:14px; color:var(--text-main);">
        <p><strong>Sport:</strong> <span id="det-sport"></span></p>
        <p><strong>Status:</strong> <span id="det-status"></span></p>
        <p><strong>Type:</strong> <span id="det-type"></span></p>
        <p><strong>Tournament:</strong> <span id="det-tournament"></span></p>
        <p><strong>Duration:</strong> <span id="det-duration"></span></p>
        <p><strong>Dates:</strong> <span id="det-start"></span> to <span id="det-end"></span></p>
        <p><strong>Available Slots:</strong> <span id="det-slots"></span></p>
        <p><strong>Fee:</strong> <span id="det-fee"></span></p>
      </div>
      
      <div id="det-action-container" style="margin-top: 20px;">
        <div id="det-postpone-drawer" class="hidden" style="background:#f8fafc; padding:15px; border-radius:8px; margin-bottom:15px; border:1px solid var(--border);">
           <h4 style="margin-top:0; margin-bottom:12px;">Edit Timeline / Postpone</h4>
           <div style="display:flex; gap:10px; margin-bottom:10px;">
              <div class="form-group" style="flex:1;"><label>New Start Date</label><input type="date" id="det-postpone-start" /></div>
              <div class="form-group" style="flex:1;"><label>Duration (Days)</label><input type="number" id="det-postpone-duration" min="1" /></div>
           </div>
           <div class="form-group" style="flex:1;">
               <label>Calculated End Date</label>
               <input type="date" id="det-postpone-end" disabled />
           </div>
           <button class="btn-secondary" id="btn-submit-postpone" style="width:100%; font-size:13px; padding:10px; border-color:var(--primary); color:var(--primary);">Confirm Changes</button>
        </div>
         <button class="btn-secondary hidden" id="btn-toggle-registration" style="width:100%; margin-bottom:10px; background:var(--warning); color:white; border:none; padding:12px; font-weight:600;">Reg. Status</button>
         <button class="btn-secondary" id="btn-submit-register" style="width:100%; background:var(--success); color:white; border:none; padding:12px; font-weight:600;">Register</button>
         <button class="btn-danger hidden" id="btn-cancel-register" style="width:100%; border:none; padding:12px; font-weight:600;">Cancel Registration</button>
         <button class="btn-danger hidden" id="btn-start-event" style="width:100%; margin-top:10px; padding:12px; font-weight:600;">Start Event</button>
         <button class="btn-danger hidden" id="btn-pause-event" style="width:100%; margin-top:10px; padding:12px; font-weight:600;">Pause Event</button>
         <button class="btn-danger hidden" id="btn-open-postpone" style="width:100%; margin-top:10px; padding:12px; font-weight:600;">Postpone Event</button>
         <button class="btn-danger hidden" id="btn-open-delete-event" style="width:100%; margin-top:10px; padding:12px; font-weight:600;">Delete Event</button>
         <div id="det-msg" class="message" style="margin-top:10px;"></div>
      </div>
    </div>
  </div>

  <!-- Delete Modal -->
  <div id="delete-modal" class="modal-overlay hidden">
    <div class="modal-content">
      <h3>Delete Account</h3>
      <p>This action is irreversible. To permanently delete your account, please confirm your password.</p>
      <form id="form-delete-account">
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="delete-password" required />
        </div>
        <div id="delete-msg" class="message"></div>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" id="btn-cancel-delete" style="width:50%">Cancel</button>
          <button type="submit" class="btn-danger" style="width:50%">Confirm Deletion</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Delete Event Modal -->
  <div id="delete-event-modal" class="modal-overlay hidden" style="z-index: 10065;">
    <div class="modal-content">
      <h3>Delete Event</h3>
      <p>Enter your password to authorize permanently tearing down this event.</p>
      <form id="form-delete-event">
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="delete-event-password" required />
        </div>
        <div id="delete-event-msg" class="message"></div>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" id="btn-cancel-delete-event" style="width:50%">Cancel</button>
          <button type="submit" class="btn-danger" style="width:50%">Authorize Delete</button>
        </div>
      </form>
    </div>
  </div>
  
  <!-- Profile Detail Modal -->
  <div id="profile-details-modal" class="modal-overlay hidden" style="z-index: 10060;">
    <div class="modal-content">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
        <h3 id="prof-det-name" style="margin:0; color:var(--text-main);"></h3>
        <button class="close-btn" id="btn-close-prof-det">×</button>
      </div>
      <div><strong>Username:</strong> <span id="prof-det-user" style="color:var(--text-muted);"></span></div>
      <div style="margin-top:10px;"><strong>Role:</strong> <span id="prof-det-role" style="color:var(--primary);"></span></div>
      <div id="prof-det-roll-container" style="margin-top:10px;" class="hidden"><strong>Roll No:</strong> <span id="prof-det-roll" style="color:var(--text-muted);"></span></div>
    </div>
  </div>

  <!-- Team Detail Modal -->
  <div id="team-details-modal" class="modal-overlay hidden" style="z-index: 10060;">
    <div class="modal-content" style="max-width: 450px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
        <h3 id="team-det-name" style="margin:0; color:var(--text-main);"></h3>
        <button class="close-btn" id="btn-close-team-det">×</button>
      </div>
      <p><strong>Sport:</strong> <span id="team-det-sport"></span></p>
      <p><strong>Capacity Map:</strong> <span id="team-det-members-count"></span> / <span id="team-det-cap"></span></p>
      <div style="margin-top:10px;">
         <strong>Members:</strong>
         <div id="team-det-members" style="background:#f8fafc; padding:10px; border-radius:6px; margin-top:5px; max-height:100px; overflow-y:auto; font-size:13px; color:var(--text-muted);"></div>
      </div>
      
      <div id="team-det-action" style="margin-top:20px; display:flex; flex-direction:column; gap:8px;">
         <button class="btn-secondary hidden" id="btn-send-team-req" style="width:100%; background:var(--primary); color:white; border:none; padding:12px; font-weight:600;">Send Join Request</button>
         <button class="btn-secondary hidden" id="btn-leave-team" style="width:100%; padding:12px; font-weight:600; border:1px solid var(--border);">Leave Team</button>
         <button class="btn-secondary hidden" id="btn-register-sport" style="width:100%; background:var(--success); color:white; border:none; padding:12px; font-weight:600;">Register for Sport</button>
         <button class="btn-danger hidden" id="btn-unregister-sport" style="width:100%; border:none; padding:12px; font-weight:600;">Unregister from Event</button>
         <button class="btn-danger hidden" id="btn-delete-team" style="width:100%; padding:12px; font-weight:600;">Delete Team</button>
         <div id="team-det-msg" class="message text-center" style="margin-top:5px;"></div>
      </div>
    </div>
  </div>

  <!-- Remove Member Modal -->
  <div id="remove-member-modal" class="modal-overlay hidden" style="z-index: 10065;">
    <div class="modal-content" style="max-width: 400px;">
      <h3>Remove Member</h3>
      <p>Select a reason for kicking <strong id="rm-target"></strong> from the team:</p>
      <form id="form-remove-member">
        <div class="form-group">
          <select id="rm-reason" style="width:100%; border:1px solid var(--border); padding:8px; border-radius:8px;" onchange="document.getElementById('rm-custom-text-container').classList.toggle('hidden', this.value !== 'Other')">
            <option value="Not active enough">Not active enough</option>
            <option value="Violating team rules">Violating team rules</option>
            <option value="Inappropriate behavior">Inappropriate behavior</option>
            <option value="Other">Other (Type custom reason)</option>
          </select>
        </div>
        <div class="form-group hidden" id="rm-custom-text-container">
           <input type="text" id="rm-custom-text" placeholder="Specify custom reason" style="width:100%;" />
        </div>
        <div id="rm-msg" class="message"></div>
        <div class="modal-actions" style="margin-top:15px;">
          <button type="button" class="btn-secondary" id="btn-cancel-rm" style="width:50%;">Cancel</button>
          <button type="submit" class="btn-danger" style="width:50%;">Kick Member</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Notif Modal -->
  <div id="notif-modal" class="modal-overlay hidden">
    <div class="notif-modal-content">
      <div class="notif-header-row">
        <div style="display:flex; align-items:center; gap: 12px;">
           <h3 style="margin:0;">Notifications</h3>
           <button class="btn-secondary hidden" id="btn-open-composer" style="font-size:12px; padding: 4px 8px;">New Broadcast</button>
        </div>
        <div>
          <button class="btn-secondary" id="btn-read-all" style="font-size:12px; padding: 6px 12px; margin-right: 8px;">Mark all as read</button>
          <button class="close-btn" id="btn-close-notifs">×</button>
        </div>
      </div>
      <div class="notif-list" id="notif-list-container" style="flex:1;"></div>
    </div>
  </div>

  <!-- Composer Modal -->
  <div id="composer-modal" class="modal-overlay hidden" style="z-index: 1001;">
    <div class="modal-content" style="max-width: 450px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
        <h3 id="composer-title" style="margin:0; color:var(--text-main);">Send Broadcast</h3>
        <button class="close-btn" id="btn-close-composer">×</button>
      </div>
      <div class="form-group">
        <label>Notification Title</label>
        <input type="text" id="comp-title" placeholder="Title..." />
      </div>
      <div class="form-group">
        <label>Message Body</label>
        <textarea id="comp-body" rows="4" placeholder="Write your message..." style="width:100%; border:1px solid var(--border); border-radius:8px; padding:10px; outline:none; font-family:inherit;"></textarea>
      </div>
      <button class="btn-secondary" id="btn-send-notif" style="width:100%; background:var(--primary); color:white; border:none; padding:12px; font-weight:600;">Submit Broadcast</button>
    </div>
  </div>
`;

async function renderDashboard() {
  const currentUsername = localStorage.getItem('fasttrack_username');
  if (!currentUsername) return renderLogin();

  document.querySelector('#app').innerHTML = dashboardTemplate;

  // Sidebar toggle
  const sidebar = document.getElementById('sidebar');
  document.getElementById('toggle-sidebar').addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('fasttrack_username');
    renderLogin();
  });

  // Fetch Profile data
  try {
    const res = await fetch(`http://localhost:8080/api/profile/${currentUsername}`);
    if (res.ok) {
      const data = await res.json();
      document.getElementById('profile-name-display').textContent = data.name;
      document.getElementById('profile-role-display').textContent = data.role;
      document.getElementById('update-username').value = data.username;
      
      if (data.role !== 'ADMIN') {
        document.getElementById('danger-zone-container').classList.remove('hidden');
      }
      
      if (data.role === 'ADMIN') {
        document.getElementById('btn-open-composer').classList.remove('hidden');
        document.getElementById('composer-title').textContent = 'Send Broadcast';
        document.getElementById('btn-create-event-fab').classList.remove('hidden');
      } else if (data.role === 'ORGANIZER') {
        document.getElementById('btn-open-composer').classList.remove('hidden');
        document.getElementById('composer-title').textContent = 'Request Broadcast';
        document.getElementById('btn-create-event-fab').classList.remove('hidden');
      } else if (data.role === 'PLAYER') {
        document.getElementById('menu-my-registrations').style.display = 'flex';
        document.getElementById('menu-create-team').style.display = 'flex';
        document.getElementById('menu-my-teams').style.display = 'flex';
      }

      if (data.profilePicture) {
        document.getElementById('profile-pic-display').src = data.profilePicture;
        document.getElementById('profile-pic-display').classList.remove('hidden');
        document.getElementById('profile-pic-placeholder').classList.add('hidden');
      }
    }
  } catch (err) {
    console.error("Failed to load profile", err);
  }

  // Delete Modal Interactions
  const deleteModal = document.getElementById('delete-modal');
  document.getElementById('btn-show-delete-modal').addEventListener('click', () => {
    deleteModal.classList.remove('hidden');
  });
  document.getElementById('btn-cancel-delete').addEventListener('click', () => {
    deleteModal.classList.add('hidden');
    document.getElementById('form-delete-account').reset();
    document.getElementById('delete-msg').style.display = 'none';
  });

  document.getElementById('form-delete-account').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('delete-msg');
    const pwd = document.getElementById('delete-password').value;

    try {
      const res = await fetch(`http://localhost:8080/api/profile/${localStorage.getItem('fasttrack_username')}/delete`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ password: pwd })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.removeItem('fasttrack_username');
        renderLogin(); // Force back to login
      } else {
        msg.className = 'message error';
        msg.textContent = data.message;
      }
    } catch(err) {
      msg.className = 'message error';
      msg.textContent = 'Network error';
    }
  });

  // Upload Picture Logic
  document.getElementById('upload-pic').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target.result;
        await fetch(`http://localhost:8080/api/profile/${localStorage.getItem('fasttrack_username')}/picture`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ profilePicture: base64 })
        });
        document.getElementById('profile-pic-display').src = base64;
        document.getElementById('profile-pic-display').classList.remove('hidden');
        document.getElementById('profile-pic-placeholder').classList.add('hidden');
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('delete-pic').addEventListener('click', async () => {
     await fetch(`http://localhost:8080/api/profile/${localStorage.getItem('fasttrack_username')}/picture`, {
         method: 'PUT',
         headers: {'Content-Type': 'application/json'},
         body: JSON.stringify({ profilePicture: null })
     });
     document.getElementById('profile-pic-display').classList.add('hidden');
     document.getElementById('profile-pic-placeholder').classList.remove('hidden');
  });

  // Change Username
  document.getElementById('form-change-username').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('username-msg');
    const newUsername = document.getElementById('update-username').value;
    
    try {
      const res = await fetch(`http://localhost:8080/api/profile/${localStorage.getItem('fasttrack_username')}/username`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ newUsername })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('fasttrack_username', newUsername);
        msg.className = 'message success';
        msg.textContent = 'Username updated!';
      } else {
        msg.className = 'message error';
        msg.textContent = data.message;
      }
    } catch(err) {
      msg.className = 'message error';
      msg.textContent = 'Network error';
    }
  });

  // Change Password
  document.getElementById('form-change-password').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('password-msg');
    const oldPassword = document.getElementById('update-pass-old').value;
    const new1 = document.getElementById('update-pass-new1').value;
    const new2 = document.getElementById('update-pass-new2').value;

    if (new1 !== new2) {
      msg.className = 'message error';
      msg.textContent = 'New passwords do not match';
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/profile/${localStorage.getItem('fasttrack_username')}/password`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ oldPassword: oldPassword, newPassword: new1 })
      });
      const data = await res.json();
      if (res.ok) {
        msg.className = 'message success';
        msg.textContent = 'Password updated!';
        e.target.reset();
      } else {
        msg.className = 'message error';
        msg.textContent = data.message;
      }
    } catch(err) {
      msg.className = 'message error';
      msg.textContent = 'Network error';
    }
  });

  // --- Notifications Logic ---
  let cachedNotifs = [];
  const notifModal = document.getElementById('notif-modal');
  const bellBadge = document.getElementById('bell-badge');

  async function fetchNotifs() {
    try {
      const res = await fetch(`http://localhost:8080/api/notifications/${currentUsername}`);
      if(res.ok) {
        const data = await res.json();
        cachedNotifs = data.notifications;
        if(data.unreadCount > 0) {
           bellBadge.classList.remove('hidden');
        } else {
           bellBadge.classList.add('hidden');
        }
        renderNotifList();
      }
    } catch(e){}
  }

  function renderNotifList() {
    const container = document.getElementById('notif-list-container');
    container.innerHTML = '';
    if(!cachedNotifs || cachedNotifs.length === 0) {
       container.innerHTML = '<div style="color:var(--text-muted); font-size:14px;">No notifications.</div>';
       return;
    }
    cachedNotifs.forEach(n => {
      const el = document.createElement('div');
      el.className = 'notif-item ' + (n.isRead ? '' : 'unread');
      let adminActions = '';
      if(n.isPending && document.getElementById('profile-role-display').textContent === 'ADMIN') {
         adminActions = `<div class="notif-admin-actions">
           <button class="btn-secondary" style="font-size:12px; padding:4px 8px; border-color:var(--success); color:var(--success);" onclick="window.approveNotif(${n.id})">Approve</button>
           <button class="btn-secondary" style="font-size:12px; padding:4px 8px; border-color:var(--error); color:var(--error);" onclick="window.rejectNotif(${n.id})">Reject</button>
         </div>`;
      }
      let teamActions = '';
      if(n.title === 'New Join Request') {
          const match = n.body.match(/\[TEAM_ID:(\d+)\]/);
          if (match && match[1]) {
              const tid = match[1];
              teamActions = `<div class="notif-admin-actions" style="margin-top:10px;">
                 <button class="btn-secondary" style="font-size:12px; padding:4px 8px; border-color:var(--success); color:var(--success);" onclick="window.resolveTeamReq(${tid}, '${n.sender}', true)">Approve Join</button>
                 <button class="btn-secondary" style="font-size:12px; padding:4px 8px; border-color:var(--error); color:var(--error);" onclick="window.resolveTeamReq(${tid}, '${n.sender}', false)">Reject Join</button>
              </div>`;
          }
      }
      el.innerHTML = `
        <div class="notif-title-row" onclick="window.toggleNotifBody(${n.id}, this)">
           <span>${n.title}</span>
           <span style="font-size:16px;">▾</span>
        </div>
        <div class="notif-sender">From: ${n.sender} ${n.isPending ? '(Pending Request)' : ''}</div>
        <div class="notif-body-container hidden">
           <div class="notif-body">${n.body.replace(/\s*\[TEAM_ID:\d+\]/, '')}</div>
           ${adminActions}
           ${teamActions}
        </div>
      `;
      container.appendChild(el);
    });
  }

  window.toggleNotifBody = (id, el) => {
    const bodyCont = el.parentElement.querySelector('.notif-body-container');
    const wasHidden = bodyCont.classList.contains('hidden');
    bodyCont.classList.toggle('hidden');
    
    // If opening, mark as read natively
    if(wasHidden && el.parentElement.classList.contains('unread')) {
       fetch(`http://localhost:8080/api/notifications/${id}/read`, {
           method: 'POST',
           headers: {'Content-Type': 'application/json'},
           body: JSON.stringify({username: currentUsername})
       }).then(() => fetchNotifs());
    }
  };

  window.approveNotif = (id) => {
    fetch(`http://localhost:8080/api/notifications/${id}/approve`, {
       method: 'POST',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify({adminUsername: currentUsername})
    }).then(() => fetchNotifs());
  };

  window.rejectNotif = (id) => {
    fetch(`http://localhost:8080/api/notifications/${id}/reject`, {
       method: 'POST',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify({adminUsername: currentUsername})
    }).then(() => fetchNotifs());
  };

  window.resolveTeamReq = async (teamId, requesterUsername, approve) => {
      try {
          const res = await fetch(`http://localhost:8080/api/teams/${teamId}/resolve-request`, {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ username: currentUsername, requester: requesterUsername, approve })
          });
          const data = await res.json();
          if (res.ok) {
              alert("Action recorded successfully!");
              fetchNotifs();
          } else {
              alert(data.message);
          }
      } catch(e) {
          alert("Network error.");
      }
  };

  document.getElementById('bell-btn-top').addEventListener('click', () => {
    notifModal.classList.remove('hidden');
  });
  document.getElementById('btn-close-notifs').addEventListener('click', () => {
    notifModal.classList.add('hidden');
  });
  document.getElementById('btn-read-all').addEventListener('click', async () => {
    await fetch(`http://localhost:8080/api/notifications/read-all`, {
       method: 'POST',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify({username: currentUsername})
    });
    fetchNotifs();
  });

  const composerModal = document.getElementById('composer-modal');
  document.getElementById('btn-open-composer').addEventListener('click', () => {
     composerModal.classList.remove('hidden');
  });
  document.getElementById('btn-close-composer').addEventListener('click', () => {
     composerModal.classList.add('hidden');
  });

  document.getElementById('btn-send-notif').addEventListener('click', async () => {
     const title = document.getElementById('comp-title').value;
     const body = document.getElementById('comp-body').value;
     if(!title || !body) return;
     
     if(confirm('Submit this notification broadcast?')) {
       await fetch('http://localhost:8080/api/notifications/create', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ senderUsername: currentUsername, title, body })
       });
       document.getElementById('comp-title').value = '';
       document.getElementById('comp-body').value = '';
       composerModal.classList.add('hidden');
       alert('Broadcast request submitted!');
       fetchNotifs();
     }
  });

  fetchNotifs(); // Initial polling trigger

  // --- Events Logic ---
  const menuProfile = document.getElementById('menu-profile');
  const menuEvents = document.getElementById('menu-events');
  const sectionProfile = document.getElementById('section-profile');
  const sectionEvents = document.getElementById('section-events');
  const menuMyRegistrations = document.getElementById('menu-my-registrations');
  const menuCreateTeam = document.getElementById('menu-create-team');
  const menuMyTeams = document.getElementById('menu-my-teams');
  
  const sectionMyRegistrations = document.getElementById('section-my-registrations');
  const sectionCreateTeam = document.getElementById('section-create-team');
  const sectionMyTeams = document.getElementById('section-my-teams');
  
  function hideAllSections() {
     sectionProfile.classList.add('hidden');
     sectionEvents.classList.add('hidden');
     sectionMyRegistrations.classList.add('hidden');
     sectionCreateTeam.classList.add('hidden');
     sectionMyTeams.classList.add('hidden');
     
     menuProfile.classList.remove('active');
     menuEvents.classList.remove('active');
     menuMyRegistrations.classList.remove('active');
     menuCreateTeam.classList.remove('active');
     menuMyTeams.classList.remove('active');
  }

  menuProfile.addEventListener('click', () => {
     hideAllSections();
     menuProfile.classList.add('active');
     sectionProfile.classList.remove('hidden');
  });

  menuEvents.addEventListener('click', () => {
     hideAllSections();
     menuEvents.classList.add('active');
     sectionEvents.classList.remove('hidden');
     fetchEvents();
  });

  menuMyRegistrations.addEventListener('click', () => {
     hideAllSections();
     menuMyRegistrations.classList.add('active');
     sectionMyRegistrations.classList.remove('hidden');
     fetchMyRegistrations();
  });

  menuCreateTeam.addEventListener('click', () => {
     hideAllSections();
     menuCreateTeam.classList.add('active');
     sectionCreateTeam.classList.remove('hidden');
     populateSportsDropdown();
  });
  
  menuMyTeams.addEventListener('click', () => {
     hideAllSections();
     menuMyTeams.classList.add('active');
     sectionMyTeams.classList.remove('hidden');
     fetchMyTeams();
  });

  const createEventModal = document.getElementById('create-event-modal');
  document.getElementById('btn-create-event-fab').addEventListener('click', () => {
     createEventModal.classList.remove('hidden');
  });
  document.getElementById('btn-close-event-modal').addEventListener('click', () => {
     createEventModal.classList.add('hidden');
  });

  // Base64 helper
  function toBase64(file) {
     return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
     });
  }

  document.getElementById('ev-team').addEventListener('change', (e) => {
     if(e.target.value === 'true') {
        document.getElementById('ev-team-params').classList.remove('hidden');
     } else {
        document.getElementById('ev-team-params').classList.add('hidden');
     }
  });

  document.getElementById('btn-submit-event').addEventListener('click', async () => {
     const eventName = document.getElementById('ev-name').value;
     const sport = document.getElementById('ev-sport').value;
     const fee = document.getElementById('ev-fee').value;
     
     const isTeamSport = document.getElementById('ev-team').value === 'true';
     const duration = document.getElementById('ev-duration').value;
     const startDate = document.getElementById('ev-start').value;
     const endDate = document.getElementById('ev-end').value;
     const totalSlots = document.getElementById('ev-total').value;
     
     const fileInput = document.getElementById('ev-pic');
     let picture = null;
     
     const tournamentType = document.getElementById('ev-tournament') ? document.getElementById('ev-tournament').value : '';
     const teamCap = document.getElementById('ev-cap').value;
     const minRequired = document.getElementById('ev-min').value;

     if(!eventName || !sport || !fee || !duration || !startDate || !endDate || !totalSlots) {
         alert("Please fill out all core event details.");
         return;
     }
     
     if (isTeamSport && (!teamCap || !minRequired)) {
         alert("Please fill out team capacity requirements for Team Sports.");
         return;
     }
     
     if(fileInput.files.length > 0) {
        picture = await toBase64(fileInput.files[0]);
     }
     

     await fetch('http://localhost:8080/api/events/create', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 
             eventName, sport, fee, picture, 
             isTeamSport, duration, startDate, endDate, totalSlots,
             tournamentType, teamCap, minRequired,
             createdBy: currentUsername 
        })
     });
     
     document.getElementById('ev-name').value = '';
     document.getElementById('ev-sport').value = '';
     document.getElementById('ev-fee').value = '';
     document.getElementById('ev-duration').value = '';
     document.getElementById('ev-start').value = '';
     document.getElementById('ev-end').value = '';
     document.getElementById('ev-total').value = '';
     document.getElementById('ev-cap').value = '';
     document.getElementById('ev-min').value = '';
     fileInput.value = '';
     
     createEventModal.classList.add('hidden');
     fetchEvents();
  });

  async function fetchEvents() {
     try {
       const res = await fetch(`http://localhost:8080/api/events?username=${currentUsername}`);
       if(res.ok) {
         const data = await res.json();
         renderEvents(data);
       }
     } catch(e){}
  }

  function renderEvents(events) {
     const grid = document.getElementById('events-grid');
     grid.innerHTML = '';
     
     if(!events || events.length === 0) {
        grid.innerHTML = '<div style="color:var(--text-muted); font-size:16px;">No Events going on</div>';
        grid.style.display = 'block';
        return;
     }
     grid.style.display = 'grid';
     
     const currentRole = document.getElementById('profile-role-display').textContent;
     
     events.forEach(e => {
        const div = document.createElement('div');
        div.className = 'event-tile';
        
        const imgSrc = e.picture ? e.picture : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlMmU4ZjAiIC8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTRlM2I4IiBkeT0iLjNlbSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'; // blank dummy pic
        
        const regStatusClass = e.isRegistered ? 'status-registered' : 'status-not-registered';
        const regStatusText = e.isRegistered ? 'Registered' : 'Not Registered';
        
        const statusHtml = currentRole === 'PLAYER' ? `<div class="event-status ${regStatusClass}">${regStatusText}</div>` : '';
        
        const openStatusColor = e.isRegistrationOpen ? '#166534' : '#991b1b';
        const openStatusBg = e.isRegistrationOpen ? '#dcfce7' : '#fee2e2';
        let openStatusText = e.isRegistrationOpen ? 'Registration Open' : 'Registration Closed';
        
        if (e.eventStatus === 'Ongoing') openStatusText = 'Ongoing';
        else if (e.eventStatus === 'Paused') openStatusText = 'Paused';
        else if (e.eventStatus === 'Postponed') openStatusText = 'Postponed';
        const openStatusBadge = `<div style="position:absolute; top:10px; right:10px; background:${openStatusBg}; color:${openStatusColor}; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:10;">${openStatusText}</div>`;
        
        // Encode object properly to avoid breaking quotes
        const eStr = JSON.stringify(e).replace(/"/g, '&quot;');
        
        div.innerHTML = `
           <div style="position:relative;">
              <img class="event-img" src="${imgSrc}" alt="${e.eventName}" style="cursor:pointer;" onclick="window.openDetails(${eStr})" />
              ${openStatusBadge}
           </div>
           <div class="event-details" style="cursor:pointer;" onclick="window.openDetails(${eStr})">
              <div class="event-name">${e.eventName}</div>
              <div class="event-sport">${e.sport}</div>
              <div class="event-fee">Reg Fee: ${e.fee ? 'PKR ' + e.fee : 'Free'}</div>
              ${statusHtml}
           </div>
        `;
        grid.appendChild(div);
     });
  }

  let activeEventId = null;
  const detModal = document.getElementById('event-details-modal');
  document.getElementById('btn-close-details').addEventListener('click', () => {
       detModal.classList.add('hidden');
       document.getElementById('det-msg').style.display = 'none';
  });

  document.getElementById('btn-submit-register').addEventListener('click', async () => {
       if(!activeEventId) return;
       const msg = document.getElementById('det-msg');
       msg.style.display = 'block';
       try {
          const res = await fetch(`http://localhost:8080/api/events/${activeEventId}/register`, {
             method: 'POST',
             headers: {'Content-Type': 'application/json'},
             body: JSON.stringify({username: currentUsername})
          });
          const data = await res.json();
          if(res.ok) {
             msg.className = 'message success';
             msg.textContent = 'Registered Successfully!';
             document.getElementById('btn-submit-register').classList.add('hidden');
             document.getElementById('det-slots').textContent = data.availableSlots;
             fetchEvents();
          } else {
             msg.className = 'message error';
             msg.textContent = data.message;
          }
       } catch(e) {
          msg.className = 'message error';
          msg.textContent = 'Network Error';
       }
  });

  document.getElementById('btn-toggle-registration').addEventListener('click', async () => {
       if(!activeEventId) return;
       try {
           await fetch(`http://localhost:8080/api/events/${activeEventId}/toggle-registration`, {
               method: 'POST'
           });
           detModal.classList.add('hidden');
           fetchEvents();
       } catch(e) { }
  });
  
  document.getElementById('btn-start-event').addEventListener('click', async () => {
       if(!activeEventId || !confirm("Start this event now? This will lock rosters.")) return;
       try {
           await fetch(`http://localhost:8080/api/events/${activeEventId}/start`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({username: currentUsername}) });
           detModal.classList.add('hidden');
           fetchEvents();
       } catch(e) {}
  });

  document.getElementById('btn-pause-event').addEventListener('click', async () => {
       if(!activeEventId || !confirm("Pause this event?")) return;
       try {
           await fetch(`http://localhost:8080/api/events/${activeEventId}/pause`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({username: currentUsername}) });
           detModal.classList.add('hidden');
           fetchEvents();
       } catch(e) {}
  });

  document.getElementById('btn-cancel-register').addEventListener('click', async () => {
       if(!activeEventId || !confirm("Are you sure you want to drop your registration explicitly?")) return;
       try {
           const res = await fetch(`http://localhost:8080/api/events/${activeEventId}/cancel-registration`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({username: currentUsername}) });
           if(res.ok) {
                detModal.classList.add('hidden');
                fetchEvents();
           } else {
                const data = await res.json();
                alert(data.message);
           }
       } catch(e) { alert("Network dropped."); }
  });

  document.getElementById('btn-open-postpone').addEventListener('click', () => {
       document.getElementById('det-postpone-drawer').classList.toggle('hidden');
  });

  function calculateEndDate() {
       const start = document.getElementById('det-postpone-start').value;
       const days = parseInt(document.getElementById('det-postpone-duration').value);
       if(start && days > 0) {
            const date = new Date(start);
            date.setDate(date.getDate() + days - 1);
            document.getElementById('det-postpone-end').value = date.toISOString().split('T')[0];
       }
  }

  document.getElementById('det-postpone-start').addEventListener('change', calculateEndDate);
  document.getElementById('det-postpone-duration').addEventListener('input', calculateEndDate);

  document.getElementById('btn-submit-postpone').addEventListener('click', async () => {
       if(!activeEventId) return;
       const startDate = document.getElementById('det-postpone-start').value;
       const days = document.getElementById('det-postpone-duration').value;
       const endDate = document.getElementById('det-postpone-end').value;
       if(!startDate || !days || !endDate) return;
       
       const duration = days + " Days";
       
       try {
           await fetch(`http://localhost:8080/api/events/${activeEventId}/postpone`, {
               method: 'POST',
               headers: {'Content-Type': 'application/json'},
               body: JSON.stringify({startDate, duration, endDate})
           });
           document.getElementById('det-postpone-drawer').classList.add('hidden');
           document.getElementById('event-details-modal').classList.add('hidden');
           fetchEvents();
       } catch(e) {}
  });

  document.getElementById('btn-open-delete-event').addEventListener('click', () => {
       document.getElementById('delete-event-modal').classList.remove('hidden');
       document.getElementById('delete-event-msg').textContent = '';
       document.getElementById('delete-event-password').value = '';
  });
  
  document.getElementById('btn-cancel-delete-event').addEventListener('click', () => {
       document.getElementById('delete-event-modal').classList.add('hidden');
  });

  document.getElementById('form-delete-event').addEventListener('submit', async (e) => {
       e.preventDefault();
       if(!activeEventId) return;
       const pwd = document.getElementById('delete-event-password').value;
       if(!pwd) return;
       
       const msg = document.getElementById('delete-event-msg');
       try {
           const res = await fetch(`http://localhost:8080/api/events/${activeEventId}/delete`, {
               method: 'POST',
               headers: {'Content-Type': 'application/json'},
               body: JSON.stringify({username: currentUsername, password: pwd})
           });
           const data = await res.json();
           if(res.ok) {
               document.getElementById('delete-event-modal').classList.add('hidden');
               document.getElementById('event-details-modal').classList.add('hidden');
               fetchEvents();
           } else {
               msg.textContent = data.message;
               msg.className = 'message error';
               msg.style.display = 'block';
           }
       } catch(e) {
           msg.textContent = "Network error";
           msg.className = 'message error';
           msg.style.display = 'block';
       }
  });

  window.openDetails = (e) => {
       activeEventId = e.id;
       document.getElementById('det-name').textContent = e.eventName;
       document.getElementById('det-sport').textContent = e.sport;
       document.getElementById('det-status').textContent = e.eventStatus || 'Upcoming';
       document.getElementById('det-type').textContent = e.isTeamSport ? 'Team Sport' : 'Individual Player';
       document.getElementById('det-tournament').textContent = e.tournamentType || 'N/A';
       document.getElementById('det-duration').textContent = e.duration || 'N/A';
       document.getElementById('det-start').textContent = e.startDate || 'N/A';
       document.getElementById('det-end').textContent = e.endDate || 'N/A';
       document.getElementById('det-slots').textContent = e.availableSlots || '0';
       document.getElementById('det-fee').textContent = e.fee ? 'PKR ' + e.fee : 'Free';
       
       const imgSrc = e.picture ? e.picture : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlMmU4ZjAiIC8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTRlM2I4IiBkeT0iLjNlbSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'; // blank dummy pic
       document.getElementById('det-img').src = imgSrc;
       
       const currentRole = document.getElementById('profile-role-display').textContent;
       const btnAction = document.getElementById('det-action-container');
       const btnReg = document.getElementById('btn-submit-register');
       const btnToggle = document.getElementById('btn-toggle-registration');
       
       document.getElementById('det-msg').style.display = 'none';
       
       const btnStart = document.getElementById('btn-start-event');
       const btnPause = document.getElementById('btn-pause-event');
       const btnCancel = document.getElementById('btn-cancel-register');
       
       btnStart.classList.add('hidden');
       btnPause.classList.add('hidden');
       btnCancel.classList.add('hidden');

       if (currentRole !== 'PLAYER') {
           btnAction.classList.remove('hidden');
           btnReg.classList.add('hidden');
           btnToggle.classList.remove('hidden');
           btnToggle.textContent = e.isRegistrationOpen ? 'Close Registration' : 'Open Registration';
           btnToggle.style.background = e.isRegistrationOpen ? 'var(--warning)' : 'var(--success)';
           
           if(e.eventStatus !== 'Ongoing') btnStart.classList.remove('hidden');
           if(e.eventStatus === 'Ongoing') btnPause.classList.remove('hidden');

           const btnPostpone = document.getElementById('btn-open-postpone');
           btnPostpone.classList.remove('hidden');
           document.getElementById('det-postpone-drawer').classList.add('hidden');
           document.getElementById('btn-open-delete-event').classList.remove('hidden');
       } else {
           btnAction.classList.remove('hidden');
           btnToggle.classList.add('hidden');
           document.getElementById('btn-open-postpone').classList.add('hidden');
           document.getElementById('btn-open-delete-event').classList.add('hidden');
           if (!e.isRegistrationOpen && !e.isRegistered) {
               btnReg.classList.add('hidden');
               document.getElementById('det-msg').style.display = 'block';
               document.getElementById('det-msg').className = 'message error';
               document.getElementById('det-msg').textContent = 'Registration is currently closed.';
           } else if (e.isTeamSport) {
               btnReg.classList.add('hidden');
               document.getElementById('det-msg').style.display = 'block';
               document.getElementById('det-msg').className = 'message info';
               document.getElementById('det-msg').textContent = 'Team matches isolate direct player bounds.';
           } else if (e.isRegistered) {
               btnReg.classList.add('hidden');
               if(e.eventStatus === "Ongoing") {
                   document.getElementById('det-msg').style.display = 'block';
                   document.getElementById('det-msg').className = 'message error';
                   document.getElementById('det-msg').textContent = 'Event has started. Cannot cancel registration.';
               } else {
                   btnCancel.classList.remove('hidden');
               }
           } else if (e.availableSlots <= 0 && e.totalSlots > 0) {
               btnReg.classList.add('hidden');
               document.getElementById('det-msg').style.display = 'block';
               document.getElementById('det-msg').className = 'message error';
               document.getElementById('det-msg').textContent = 'Total capacity achieved.';
           } else {
               btnReg.classList.remove('hidden');
           }
       }
       
       detModal.classList.remove('hidden');
  };

  async function fetchMyRegistrations() {
      try {
          const res = await fetch(`http://localhost:8080/api/events?username=${currentUsername}`);
          if(res.ok) {
              const data = await res.json();
              const myEvents = data.filter(e => e.isRegistered);
              const grid = document.getElementById('my-registrations-grid');
              const msg = document.getElementById('my-regs-msg');
              grid.innerHTML = '';
              msg.classList.add('hidden');
              if(myEvents.length === 0) {
                  msg.textContent = "You haven't registered for any events yet.";
                  msg.className = 'message info';
                  msg.style.display = 'block';
                  msg.classList.remove('hidden');
              } else {
                  myEvents.forEach(e => {
                      const div = document.createElement('div');
                      div.className = 'event-tile';
                      const imgSrc = e.picture ? e.picture : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlMmU4ZjAiIC8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTRlM2I4IiBkeT0iLjNlbSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                      const eStr = JSON.stringify(e).replace(/"/g, '&quot;');
                      div.innerHTML = `
                         <div style="position:relative;">
                            <img class="event-img" src="${imgSrc}" alt="${e.eventName}" style="cursor:pointer;" onclick="window.openDetails(${eStr})" />
                         </div>
                         <div class="event-details" style="cursor:pointer;" onclick="window.openDetails(${eStr})">
                            <div class="event-name">${e.eventName}</div>
                            <div class="event-sport">${e.sport}</div>
                            <div class="event-fee">Reg Fee: ${e.fee ? 'PKR ' + e.fee : 'Free'}</div>
                         </div>
                      `;
                      grid.appendChild(div);
                  });
              }
          }
      } catch(e){}
  }

  async function fetchMyTeams() {
      try {
          const res = await fetch(`http://localhost:8080/api/teams/my?username=${currentUsername}`);
          if(res.ok) {
              const myTeams = await res.json();
              const grid = document.getElementById('my-teams-grid');
              const msg = document.getElementById('my-teams-msg');
              grid.innerHTML = '';
              msg.classList.add('hidden');
              if(myTeams.length === 0) {
                  msg.textContent = "You don't belong to any teams.";
                  msg.className = 'message info';
                  msg.style.display = 'block';
                  msg.classList.remove('hidden');
              } else {
                  myTeams.forEach(t => {
                      const div = document.createElement('div');
                      div.className = 'event-tile';
                      const imgSrc = t.logo ? t.logo : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlMmU4ZjAiIC8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTRlM2I4IiBkeT0iLjNlbSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                      const tStr = JSON.stringify(t).replace(/"/g, '&quot;');
                      
                      div.innerHTML = `
                         <div style="position:relative;">
                            <img class="event-img" src="${imgSrc}" style="cursor:pointer;" onclick="window.openTeamDet(${tStr})" />
                         </div>
                         <div class="event-details" style="cursor:pointer;" onclick="window.openTeamDet(${tStr})">
                            <div class="event-name">${t.name}</div>
                            <div class="event-sport">${t.sport}</div>
                            <div class="event-fee">${t.members.length} / ${t.teamCap || 'N/A'} Capacity Map</div>
                         </div>
                      `;
                      grid.appendChild(div);
                  });
              }
          }
      } catch(e) {}
  }

  async function populateSportsDropdown() {
      try {
          const res = await fetch(`http://localhost:8080/api/events?username=${currentUsername}`);
          if(res.ok) {
              const data = await res.json();
              const teamSports = data.filter(e => e.isTeamSport);
              
              const sportsSet = new Set(teamSports.map(e => e.sport));
              const select = document.getElementById('team-sport');
              select.innerHTML = '<option value="" disabled selected>Select a sport...</option>';
              sportsSet.forEach(sport => {
                  const opt = document.createElement('option');
                  opt.value = sport;
                  opt.textContent = sport;
                  select.appendChild(opt);
              });
          }
      } catch(e){}
  }

  document.getElementById('form-create-team').addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = document.getElementById('team-msg');
      const name = document.getElementById('team-name').value;
      const sport = document.getElementById('team-sport').value;
      const isOpenToRequests = document.getElementById('team-open').value === 'true';
      const fileInput = document.getElementById('team-logo');
      
      let logo = null;
      if(fileInput.files.length > 0) {
         logo = await toBase64(fileInput.files[0]);
      }
      
      try {
         const res = await fetch('http://localhost:8080/api/teams/create', {
             method: 'POST',
             headers: {'Content-Type': 'application/json'},
             body: JSON.stringify({ 
                 name, sport, isOpenToRequests, logo, 
                 captainUsername: currentUsername 
             })
         });
         const data = await res.json();
         if(res.ok) {
             msg.className = 'message success';
             msg.textContent = `Team created! Capacity mapped: ${data.teamCap}`;
             document.getElementById('form-create-team').reset();
         } else {
             msg.className = 'message error';
             msg.textContent = data.message;
         }
      } catch(err) {
         msg.className = 'message error';
         msg.textContent = 'Network Error';
      }
  });

  // Search Interactions
  const searchModal = document.getElementById('search-modal');
  const searchInput = document.getElementById('global-search-input');
  
  document.getElementById('btn-close-search').addEventListener('click', () => {
      searchModal.classList.add('hidden');
  });
  
  document.getElementById('btn-search-filters').addEventListener('click', () => {
      document.getElementById('search-filter-drawer').classList.toggle('hidden');
  });
  
  document.getElementById('btn-apply-filters').addEventListener('click', executeSearch);
  
  searchInput.addEventListener('keypress', (e) => {
      if(e.key === 'Enter') {
         executeSearch();
      }
  });

  async function executeSearch() {
      const q = searchInput.value.trim();
      const sport = document.getElementById('sf-sport').value.trim();
      const openReg = document.getElementById('sf-open-reg').checked;
      const openReq = document.getElementById('sf-open-req').checked;
      
      let url = `http://localhost:8080/api/search?q=${encodeURIComponent(q)}`;
      if(sport) url += `&sport=${encodeURIComponent(sport)}`;
      if(openReg) url += `&openRegistration=true`;
      if(openReq) url += `&openRequests=true`;
      
      try {
          const res = await fetch(url);
          if(res.ok) {
              const data = await res.json();
              renderSearchResults(data);
              searchModal.classList.remove('hidden');
          }
      } catch(e) {}
  }
  
  function renderSearchResults(data) {
      const pGrid = document.getElementById('sr-profiles');
      const tGrid = document.getElementById('sr-teams');
      const eGrid = document.getElementById('sr-events');
      
      pGrid.innerHTML = '';
      tGrid.innerHTML = '';
      eGrid.innerHTML = '';
      
      if(data.profiles.length === 0) pGrid.innerHTML = '<div style="color:var(--text-muted);">No profiles found</div>';
      else {
          data.profiles.forEach(p => {
             const div = document.createElement('div');
             div.className = 'event-tile';
             div.style.cursor = 'pointer';
             const pStr = JSON.stringify(p).replace(/"/g, '&quot;');
             div.innerHTML = `<div style="padding:10px;" onclick="window.openProfileDet(${pStr})"><strong>${p.name}</strong><br/><span style="color:var(--text-muted)">@${p.username} (${p.role})</span></div>`;
             pGrid.appendChild(div);
          });
      }
      
      if(data.teams.length === 0) tGrid.innerHTML = '<div style="color:var(--text-muted);">No teams found</div>';
      else {
          data.teams.forEach(t => {
             const div = document.createElement('div');
             div.className = 'event-tile';
             div.style.cursor = 'pointer';
             const tStr = JSON.stringify(t).replace(/"/g, '&quot;');
             div.innerHTML = `<div style="padding:10px;" onclick="window.openTeamDet(${tStr})"><strong>${t.name}</strong><br/>Sport: ${t.sport}<br/><span style="color:${t.isOpenToRequests ? 'green' : 'red'};">${t.isOpenToRequests ? 'Accepting Requests' : 'Closed to Requests'}</span></div>`;
             tGrid.appendChild(div);
          });
      }
      
      if(data.events.length === 0) eGrid.innerHTML = '<div style="color:var(--text-muted);">No events found</div>';
      else {
          data.events.forEach(ev => {
             const div = document.createElement('div');
             div.className = 'event-tile';
             div.style.cursor = 'pointer';
             const eStr = JSON.stringify(ev).replace(/"/g, '&quot;');
             div.innerHTML = `<div style="padding:10px;" onclick="window.openDetails(${eStr})"><strong>${ev.eventName}</strong><br/>Sport: ${ev.sport}<br/><span style="color:${ev.isRegistrationOpen ? 'green' : 'red'};">${ev.isRegistrationOpen ? 'Registration Open' : 'Registration Closed'}</span></div>`;
             eGrid.appendChild(div);
          });
      }
  }

  window.openProfileDet = (p) => {
      document.getElementById('prof-det-name').textContent = p.name;
      document.getElementById('prof-det-user').textContent = p.username;
      document.getElementById('prof-det-role').textContent = p.role;
      if (p.rollNumber) {
          document.getElementById('prof-det-roll-container').classList.remove('hidden');
          document.getElementById('prof-det-roll').textContent = p.rollNumber;
      } else {
          document.getElementById('prof-det-roll-container').classList.add('hidden');
      }
      document.getElementById('profile-details-modal').classList.remove('hidden');
  };

  document.getElementById('btn-close-prof-det').addEventListener('click', () => {
      document.getElementById('profile-details-modal').classList.add('hidden');
  });

  let activeTeamId = null;
  window.openTeamDet = (t) => {
      activeTeamId = t.id;
      document.getElementById('team-det-name').textContent = t.name;
      document.getElementById('team-det-sport').textContent = t.sport;
      document.getElementById('team-det-members-count').textContent = t.members.length;
      document.getElementById('team-det-cap').textContent = t.teamCap || 'N/A';
      document.getElementById('team-det-members').innerHTML = t.members.map(m => {
          let suffix = m === t.captainUsername ? ' (Captain)' : '';
          let btn = (!t.isRegistered && currentUsername === t.captainUsername && m !== t.captainUsername) ? 
            ` <button onclick="window.openRemoveMember('${m}', ${t.id}, '${t.name}')" style="margin-left:auto; font-size:10px; padding:4px 8px; border-radius:4px;" class="btn-danger">Remove</button>` : '';
          return `<div style="display:flex; align-items:center; padding:4px 8px; background:var(--bg-secondary); border-radius:4px;"><span>@${m}${suffix}</span>${btn}</div>`;
      }).join('');
      
      const btnReq = document.getElementById('btn-send-team-req');
      const btnLeave = document.getElementById('btn-leave-team');
      const btnDel = document.getElementById('btn-delete-team');
      const btnReg = document.getElementById('btn-register-sport');
      const btnUnreg = document.getElementById('btn-unregister-sport');
      const msg = document.getElementById('team-det-msg');
      msg.textContent = '';
      msg.className = 'message text-center';
      
      btnReq.classList.add('hidden');
      btnLeave.classList.add('hidden');
      btnDel.classList.add('hidden');
      btnReg.classList.add('hidden');
      btnUnreg.classList.add('hidden');
      
      if (!t.isRegistered) {
         if (currentUsername === t.captainUsername) {
             btnReg.classList.remove('hidden');
             if (t.members.length === 1) btnDel.classList.remove('hidden');
         } else if (t.members.includes(currentUsername)) {
             btnLeave.classList.remove('hidden');
         } else if (t.teamCap && t.members.length < t.teamCap && t.isOpenToRequests) {
             btnReq.classList.remove('hidden');
         }
      } else {
         msg.textContent = 'Team is actively locked globally to registered event bounds.';
         msg.className = 'message text-center success';
         if(currentUsername === t.captainUsername) {
             btnUnreg.classList.remove('hidden');
         }
      }
      document.getElementById('team-details-modal').classList.remove('hidden');
  };

  document.getElementById('btn-close-team-det').addEventListener('click', () => {
      document.getElementById('team-details-modal').classList.add('hidden');
  });

  let rmActiveTeamId = null;
  let rmActiveTarget = null;
  let rmActiveTeamName = null;
  window.openRemoveMember = (targetUser, teamId, teamName) => {
     rmActiveTarget = targetUser;
     rmActiveTeamId = teamId;
     rmActiveTeamName = teamName;
     document.getElementById('rm-target').textContent = targetUser;
     document.getElementById('rm-reason').value = 'Not active enough';
     document.getElementById('rm-custom-text-container').classList.add('hidden');
     document.getElementById('rm-custom-text').value = '';
     document.getElementById('rm-msg').className = 'message hidden';
     document.getElementById('remove-member-modal').classList.remove('hidden');
  };
  
  document.getElementById('btn-cancel-rm').addEventListener('click', () => {
     document.getElementById('remove-member-modal').classList.add('hidden');
  });
  
  document.getElementById('form-remove-member').addEventListener('submit', async (e) => {
     e.preventDefault();
     let reason = document.getElementById('rm-reason').value;
     if (reason === 'Other') reason = document.getElementById('rm-custom-text').value;
     if (!reason || !reason.trim()) { alert("Please provide a reason."); return; }
     
     const msg = document.getElementById('rm-msg');
     try {
         const res = await fetch(`http://localhost:8080/api/teams/${rmActiveTeamId}/remove-member`, {
             method: 'POST',
             headers: {'Content-Type': 'application/json'},
             body: JSON.stringify({ admin: currentUsername, target: rmActiveTarget, reason: reason })
         });
         const data = await res.json();
         if(res.ok) {
             msg.className = 'message success';
             msg.textContent = 'Member removed!';
             setTimeout(() => {
                 document.getElementById('remove-member-modal').classList.add('hidden');
                 document.getElementById('team-details-modal').classList.add('hidden');
                 fetchMyTeams();
             }, 1000);
         } else {
             msg.className = 'message error';
             msg.textContent = data.message;
         }
     } catch(err) {
         msg.className = 'message error';
         msg.textContent = 'Network error.';
     }
  });

  document.getElementById('btn-send-team-req').addEventListener('click', async () => {
      if(!activeTeamId) return;
      const msg = document.getElementById('team-det-msg');
      try {
          const res = await fetch(`http://localhost:8080/api/teams/${activeTeamId}/request-join`, {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({username: currentUsername})
          });
          const data = await res.json();
          if(res.ok) {
              msg.className = 'message success';
              msg.textContent = 'Request Sent!';
              document.getElementById('btn-send-team-req').classList.add('hidden');
          } else {
              msg.className = 'message error';
              msg.textContent = data.message;
          }
      } catch(e) {
          msg.className = 'message error';
          msg.textContent = 'Network Error';
      }
  });
  
  async function exeTeamAct(endpoint) {
      if(!activeTeamId) return;
      const msg = document.getElementById('team-det-msg');
      try {
          const res = await fetch(`http://localhost:8080/api/teams/${activeTeamId}/${endpoint}`, {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({username: currentUsername})
          });
          const data = await res.json();
          if(res.ok) {
              msg.className = 'message success';
              msg.textContent = data.message;
              setTimeout(() => {
                  document.getElementById('team-details-modal').classList.add('hidden');
                  fetchMyTeams();
              }, 1000);
          } else {
              msg.className = 'message error';
              msg.textContent = data.message;
          }
      } catch(e) {
          msg.className = 'message error';
          msg.textContent = 'Network Error';
      }
  }

  document.getElementById('btn-leave-team').addEventListener('click', () => exeTeamAct('leave'));
  document.getElementById('btn-delete-team').addEventListener('click', () => exeTeamAct('delete-team'));
  document.getElementById('btn-register-sport').addEventListener('click', () => exeTeamAct('register-sport'));
  document.getElementById('btn-unregister-sport').addEventListener('click', () => exeTeamAct('unregister-sport'));

}

function renderRegister() {
  document.querySelector('#app').innerHTML = `<div class="container">${registerTemplate}</div>`;
  
  document.getElementById('go-login').addEventListener('click', renderLogin);
  
  let currentRole = 'PLAYER';
  
  // Tab Switching Logic
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      currentRole = e.target.getAttribute('data-role');
      
      const fieldRoll = document.getElementById('field-roll');
      const fieldCode = document.getElementById('field-code');
      const inputRoll = document.getElementById('reg-roll');
      const inputCode = document.getElementById('reg-code');

      if (currentRole === 'PLAYER') {
        fieldRoll.classList.remove('hidden');
        fieldCode.classList.add('hidden');
        inputRoll.required = true;
        inputCode.required = false;
      } else {
        fieldRoll.classList.add('hidden');
        fieldCode.classList.remove('hidden');
        inputRoll.required = false;
        inputCode.required = true;
      }
    });
  });

  // Ensure initial validation state
  document.getElementById('reg-roll').required = true;

  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('reg-msg');
    
    // Password match check
    const pwd = document.getElementById('reg-password').value;
    const pwdConfirm = document.getElementById('reg-password-confirm').value;
    if (pwd !== pwdConfirm) {
      msg.className = 'message error';
      msg.textContent = 'Passwords do not match';
      return;
    }

    const payload = {
      role: currentRole,
      name: document.getElementById('reg-name').value,
      username: document.getElementById('reg-username').value,
      password: pwd
    };

    if (currentRole === 'PLAYER') {
      payload.rollNumber = document.getElementById('reg-roll').value;
    } else {
      payload.adminCode = document.getElementById('reg-code').value;
    }

    msg.className = 'message';
    msg.textContent = 'Registering...';
    msg.classList.add('success');

    try {
      const res = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        msg.className = 'message success';
        msg.textContent = 'Account created successfully! Please sign in.';
        setTimeout(() => renderLogin(), 1500);
      } else {
        msg.className = 'message error';
        msg.textContent = data.message || 'Registration failed';
      }
    } catch(err) {
      msg.className = 'message error';
      msg.textContent = 'Network Error. Is backend running?';
    }
  });
}

function renderLogin() {
  document.querySelector('#app').innerHTML = `<div class="container">${loginTemplate}</div>`;
  
  document.getElementById('go-register').addEventListener('click', renderRegister);
  
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('msg');
    msg.className = 'message';
    msg.textContent = 'Loading...';
    msg.classList.add('success'); 

    const payload = {
      username: document.getElementById('username').value,
      password: document.getElementById('password').value
    };

    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('fasttrack_username', payload.username);
        renderDashboard();
      } else {
        msg.className = 'message error';
        msg.textContent = data.message || 'Login failed';
      }
    } catch(err) {
      msg.className = 'message error';
      msg.textContent = 'Network Error. Is backend running?';
    }
  });
}

// Initial render
if (localStorage.getItem('fasttrack_username')) {
  renderDashboard();
} else {
  renderLogin();
}
