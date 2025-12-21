// scrolling transitions
// Initialize a new Lenis instance for smooth scrolling
const lenis = new Lenis({
  damping: 0.5,
});

// Synchronize Lenis scrolling with GSAP's ScrollTrigger plugin
lenis.on('scroll', ScrollTrigger.update);

// Add Lenis's requestAnimationFrame (raf) method to GSAP's ticker
// This ensures Lenis's smooth scroll animation updates on each GSAP tick
gsap.ticker.add((time) => {
  lenis.raf(time * 1000); // Convert time from seconds to milliseconds
});

// Disable lag smoothing in GSAP to prevent any delay in scroll animations
gsap.ticker.lagSmoothing(0);

//---------------

// Global elements that are *always* present in index.html (not inside dynamic tabs)
const loaderContainer = document.querySelector('#loader-container');
const pageContent = document.querySelector('#page-content');
const topBox = document.querySelector('#top-box'); // Header element
const mainContent = document.querySelector('main'); // Main content area

// IMPORTANT: Main container for dynamically loaded tab content
const tabsContentContainer = document.getElementById('tabs-content-container');
const tabToggles = document.querySelectorAll('.tabs__toggle');

// Base URL for your main backend service (resume data)

const PUBLIC_IP = 'http://localhost';
const BACKEND_PORT = 3001;
//const UPLOAD_SERVICE_PORT = 3002;
const PROD = false;

const MAIN_BACKEND_API_URL = `${PUBLIC_IP}:${BACKEND_PORT}`; 
//const UPLOAD_SERVICE_API_URL = `${PUBLIC_IP}:${UPLOAD_SERVICE_PORT}`;

// Mapping of tab data-target to their respective HTML file paths
const tabContentFileMap = {
  'my_info_tab_content.html': 'my_info_tab_content.html',
//  'illustrations_tab_content.html': 'illustrations_tab_content.html',
//  'illustrations_tab_content_for_admin.html': 'illustrations_tab_content_for_admin.html'
};

//const openLoginButton = document.getElementById('openLoginButton');
//const loginPanel = document.getElementById('loginPanel');
//const panelContent = document.getElementById('panelContent');
//const messageArea = document.getElementById('messageArea');
//const panelTitle = document.getElementById('panelTitle');
//const closePanelButton = document.getElementById('closePanelButton'); // Get the close button
//let adminEmail = ''; // To store the email ID entered in the first step

// Reference to the specific tab toggle for "Illustration Gallery"
const illustrationGalleryTabToggle = document.querySelector('.tabs__toggle[data-tab-target="illustrations_tab_content.html"]');



// -------------- utility functions for session management ------------------

/**
 * Helper function: Generates a Universally Unique Identifier (UUID v4).
 * returns {string} A new UUID string.
 */
// function generateUUID() {
//   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
//     const r = (Math.random() * 16) | 0;
//     const v = c === 'x' ? r : (r & 0x3) | 0x8;
//     return v.toString(16);
//   });
// }

// --- Function to check if "CurrentSessionID" key exists in local cache ---
/**
 * Checks if the 'CurrentSessionID' key exists in localStorage.
 * returns {boolean} True if the key exists, false otherwise.
 */
// function checkIfSessionIdExists() {
//   const SESSION_ID_KEY = 'CurrentSessionID';
//   const value = localStorage.getItem(SESSION_ID_KEY);
//   const exists = value !== null;
//   //console.log(`'${SESSION_ID_KEY}' exists in cache: ${exists}`);
//   return exists;
// }

// --- Function to read the value of "CurrentSessionID" from cache ---
/**
 * Reads the value of 'CurrentSessionID' from localStorage.
 * returns {string | null} The session ID string if found, null otherwise.
 */
// function readSessionId() {
//   const SESSION_ID_KEY = 'CurrentSessionID';
//   const sessionId = localStorage.getItem(SESSION_ID_KEY);
//   if (sessionId) {
//     //console.log(`Read '${SESSION_ID_KEY}' from cache: ${sessionId}`);
//   } else {
//     //console.log(`'${SESSION_ID_KEY}' not found in cache.`);
//   }
//   return sessionId;
// }

// --- Function to create/retrieve the "CurrentSessionID" key and store it in local cache ---
/**
 * Retrieves the 'CurrentSessionID' from localStorage.
 * If the key does not exist, it generates a new UUID, stores it, and returns it.
 * This ensures an ID is always present and avoids overwriting an existing one.
 * returns {string} The existing or newly created session ID.
 */
// function createSessionId() { // Renamed from createSessionId to better reflect its combined purpose if you want
//   const SESSION_ID_KEY = 'CurrentSessionID';
//   let sessionId = localStorage.getItem(SESSION_ID_KEY); // Try to read existing ID

//   if (!sessionId) {
//     // If no ID is found, generate a new one
//     sessionId = generateUUID(); // Assuming generateUUID() is defined elsewhere
//     localStorage.setItem(SESSION_ID_KEY, sessionId); // Store the new ID
//     //console.log(`No existing '${SESSION_ID_KEY}' found. Created and stored new ID: ${sessionId}`);
//   } else {
//     //console.log(`Existing '${SESSION_ID_KEY}' found: ${sessionId}`);
//   }
//   return sessionId;
// }

/**
 * Checks if a timestamp entry exists in the server-side cache (MongoDB collection)
 * for the current browser's session ID.
 * This function now ensures a session ID exists and makes an API call to the backend.
 *
 * returns {Promise<boolean>} True if an entry exists for the session ID, false otherwise.
 */
// async function doesVariableExistInCache() {
//   // 1. Ensure a session ID exists for the current browser instance
//   const currentSessionId = createSessionId(); // This will create if not exists, or return existing

//   if (!currentSessionId) {
//       console.error("Cannot check timestamp existence: No valid session ID available.");
//       return false;
//   }

//   // 2. Construct the API URL with the sessionId as a query parameter
//   let apiUrl = `${UPLOAD_SERVICE_API_URL}/upload-service-api/doesTSexist?sessionId=${encodeURIComponent(currentSessionId)}`;
//   if(PROD){
//     apiUrl = `/upload-service-api/doesTSexist?sessionId=${encodeURIComponent(currentSessionId)}`;
//   }

//   try {
//       //console.log(`Checking for timestamp existence via API: ${apiUrl}`);
//       const response = await fetch(apiUrl);

//       if (!response.ok) {
//           // Handle HTTP errors (e.g., 404, 500)
//           const errorBody = await response.text();
//           throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorBody}`);
//       }

//       const data = await response.json(); // Expected: { exists: true/false }

//       if (data.exists === true) {
//           //console.log(`Timestamp entry DOES exist for session ID '${currentSessionId}' in server-side cache.`);
//           return true;
//       } else {
//           //console.log(`Timestamp entry does NOT exist for session ID '${currentSessionId}' in server-side cache.`);
//           return false;
//       }
//   } catch (error) {
//       console.error(`Error checking timestamp existence via API for session ID '${currentSessionId}':`, error);
//       // In case of any error (network, parsing, etc.), assume it doesn't exist or is unreachable
//       return false;
//   }
// }

/**
 * Sends a request to the backend API to create/reset the session expiry timestamp
 * for the current browser's session ID.
 * The timestamp is calculated and stored on the server-side.
 * This function no longer uses localStorage for the timestamp itself.
 *
 * returns {Promise<boolean>} Resolves to true if the timestamp was stored successfully on the server, false otherwise.
 */
// async function storeExpiryTimestamp() {
//   // 1. Ensure a session ID exists for the current browser instance
//   const currentSessionId = createSessionId(); // This will create if not exists, or return existing

//   if (!currentSessionId) {
//       console.error("Cannot store timestamp: No valid session ID available.");
//       return false;
//   }

//   let apiUrl = `${UPLOAD_SERVICE_API_URL}/upload-service-api/createTS`; // Full API endpoint
//   if(PROD){
//     apiUrl = `/upload-service-api/createTS`;
//   }

//   try {
//       //console.log(`Sending request to create/reset timestamp for Session ID '${currentSessionId}' via API: ${apiUrl}`);
//       const response = await fetch(apiUrl, {
//           method: 'POST', // The API is a POST endpoint
//           headers: {
//               'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({ sessionId: currentSessionId }) // Send the session ID in the request body
//       });

//       if (!response.ok) {
//           // Handle HTTP errors (e.g., 400, 500)
//           const errorBody = await response.text();
//           throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorBody}`);
//       }

//       const data = await response.json(); // Expected: { success: true, message: ..., expiresAt: ... }

//       if (data.success) {
//           //console.log(`Server-side timestamp stored successfully for session '${currentSessionId}'. Expires at: ${new Date(data.expiresAt).toLocaleString()}`);
//           return true;
//       } else {
//           console.error("Server-side timestamp storage failed:", data.message);
//           return false;
//       }

//   } catch (error) {
//       console.error(`Error storing server-side timestamp for session '${currentSessionId}' via API:`, error);
//       return false;
//   }
// }


/**
 * Sends a request to the backend API to set the session expiry timestamp to zero
 * for the current browser's session ID.
 * This effectively invalidates the server-side session immediately.
 * This function no longer uses localStorage for the timestamp itself.
 *
 * returns {Promise<boolean>} Resolves to true if the timestamp was set to zero successfully on the server, false otherwise.
 */
// async function setExpiryTimestampToZero() {
//   // 1. Ensure a session ID exists for the current browser instance
//   const currentSessionId = createSessionId(); // This will create if not exists, or return existing

//   if (!currentSessionId) {
//       console.error("Cannot set timestamp to zero: No valid session ID available.");
//       return false;
//   }

//   let apiUrl = `${UPLOAD_SERVICE_API_URL}/upload-service-api/setTStoZero`; // Full API endpoint
//   if(PROD){
//     apiUrl = `/upload-service-api/setTStoZero`;
//   }


//   try {
//       //console.log(`Sending request to set timestamp to zero for Session ID '${currentSessionId}' via API: ${apiUrl}`);
//       const response = await fetch(apiUrl, {
//           method: 'POST', // The API is a POST endpoint
//           headers: {
//               'Content-Type': 'application/json' 
//           },
//           body: JSON.stringify({ sessionId: currentSessionId }) // Send the session ID in the request body
//       });

//       if (!response.ok) {
//           // Handle HTTP errors (e.g., 400, 500)
//           const errorBody = await response.text();
//           throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorBody}`);
//       }

//       const data = await response.json(); // Expected: { success: true, message: ..., value_x: ..., sessionId: ... }

//       if (data.success) {
//           //console.log(`Server-side timestamp successfully set to zero for session '${currentSessionId}'. Session is now invalid.`);
//           return true;
//       } else {
//           console.error("Server-side timestamp set to zero failed:", data.message);
//           return false;
//       }

//   } catch (error) {
//       console.error(`Error setting server-side timestamp to zero for session '${currentSessionId}' via API:`, error);
//       return false;
//   }
// }

/**
 * Checks if the server-side session for the current browser's session ID is currently valid
 * by calling a backend API.
 * This function no longer relies on localStorage for session validity itself.
 *
 * returns {Promise<boolean>} Resolves to true if the session is valid, false otherwise.
 */
// async function isSessionValid() {
//   // 1. Ensure a session ID exists for the current browser instance
//   const currentSessionId = createSessionId(); // This will create if not exists, or return existing

//   if (!currentSessionId) {
//       console.error("Cannot check session validity: No valid session ID available.");
//       return false;
//   }

//   // 2. Construct the API URL with the sessionId as a query parameter
//   let apiUrl = `${UPLOAD_SERVICE_API_URL}/upload-service-api/isSessionValid?sessionId=${encodeURIComponent(currentSessionId)}`;
//   if(PROD)
//   {    apiUrl = `/upload-service-api/isSessionValid?sessionId=${encodeURIComponent(currentSessionId)}`;
//   }

//   try {
//       //console.log(`Checking session validity for Session ID '${currentSessionId}' via API: ${apiUrl}`);
//       const response = await fetch(apiUrl);

//       if (!response.ok) {
//           // Handle HTTP errors (e.g., 404, 500)
//           const errorBody = await response.text();
//           throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorBody}`);
//       }
      
//       const data = await response.json(); // Expected: { isValid: true/false, reason?: string }
      
//       if (data.isValid === true) {
//           //console.log(`Server-side session for Session ID '${currentSessionId}' is valid.`);
//           return true;
//       } else {
//           //console.log(`Server-side session for Session ID '${currentSessionId}' is NOT valid. Reason: ${data.reason || 'Unknown'}`);
//           return false;
//       }

//   } catch (error) {
//       console.error(`Error checking server-side session validity for Session ID '${currentSessionId}' via API:`, error);
//       return false;
//   }
// }


// -------------- end of utility functions for session management ------------------

// --- Core Function to Load Tab Content ---
async function loadTabContent(filePath) {
  if (!tabsContentContainer) {
    console.error("Tabs content container not found! Cannot load tab content.");
    return;
  }

  tabsContentContainer.innerHTML = 'Loading content...'; // Display loading message

  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
    }
    const htmlContent = await response.text();

    tabsContentContainer.innerHTML = htmlContent; // Insert the fetched HTML

    // After new HTML is loaded, initialize JavaScript specific to that tab's content
    if (filePath === tabContentFileMap['my_info_tab_content.html']) {
      await initializeMyInfoContent(); // Use await as it fetches data
    }
      // else if (filePath === tabContentFileMap['illustrations_tab_content.html']) {
    //   await initializeIllustrationGallery();
    // } else if (filePath === tabContentFileMap['illustrations_tab_content_for_admin.html']) {
    //   await initializeIllustrationFormAndGallery();
    // }

    // Hide loader and show page content after the *first* tab's content is fully loaded
    // This part ensures the initial page loader disappears once the first tab's content is ready.
    if (loaderContainer.classList.contains('visible')) {
      loaderContainer.classList.remove('visible');
      loaderContainer.classList.add('invisible');
      pageContent.classList.remove('invisible');
      pageContent.classList.add('visible');
    }
  } catch (error) {
    console.error('Error loading tab content:', error);
    tabsContentContainer.innerHTML = `<p class="text-red-500">Failed to load content: ${error.message}</p>`;

    // Hide loader even on error, so user can see error message
    if (loaderContainer.classList.contains('visible')) {
      loaderContainer.classList.remove('visible');
      loaderContainer.classList.add('invisible');
      pageContent.classList.remove('invisible');
      pageContent.classList.add('visible');
    }
  }
}

// --- Helper Functions for Data Fetching (Reusable for My Info tab) ---
async function fetchAndDisplayProperty(property, displayPropertyId) {
  const element = document.getElementById(displayPropertyId);
  if (!element) {
    console.warn(`Element with ID '${displayPropertyId}' not found for property '${property}'.`);
    return; // Don't throw error if element isn't found, just skip
  }
  try {

    let apiUrl = `${MAIN_BACKEND_API_URL}/backend-api/metadata/${property}`; 
    if(PROD){
      apiUrl = `/backend-api/metadata/${property}`;
    }
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    element.textContent = data.data;
  } catch (error) {
    console.error(`Error fetching ${property}:`, error);
    element.textContent = `Failed to load ${property}.`;
  }
}

async function fetchAndReturnLink(property, linkElementId) {
  const linkElement = document.getElementById(linkElementId);
  if (!linkElement) {
    console.warn(`Link element with ID '${linkElementId}' not found for property '${property}'.`);
    return;
  }
  try {
    let apiUrl = `${MAIN_BACKEND_API_URL}/backend-api/metadata/${property}`;
    if(PROD){
      apiUrl = `/backend-api/metadata/${property}`;
    }
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.data) {
      if (property === 'email_id') {
        linkElement.href = `mailto:${data.data}`;
      } else {
        linkElement.href = data.data;
      }
    } else {
        linkElement.href = '#'; // Set a default or empty link if no data
        console.warn(`No data received for link property: ${property}`);
    }
  } catch (error) {
    console.error(`Error fetching ${property} link:`, error);
    linkElement.href = '#'; // Set a default or error link
  }
}

async function fetchAndDisplayCards(category, containerId, displayFunction) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container with ID '${containerId}' not found for category '${category}'.`);
    return;
  }
  container.innerHTML = `Loading ${category} data...`; // Loading message
  try {
    let apiUrl = `${MAIN_BACKEND_API_URL}/backend-api/data/${category}`;
    if(PROD){
      apiUrl = `/backend-api/data/${category}`;
    }
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      displayFunction(data.data, containerId); // Call specific display function
    } else {
      container.textContent = `No ${category} data available.`;
    }
  } catch (error) {
    console.error(`Error fetching ${category}:`, error);
    container.textContent = `Failed to load ${category}.`;
  }
}

function displayWorkExperience(workExperienceData, containerId) {
  const container = document.getElementById(containerId); // Re-select inside here
  if (!container) return; // Guard against element not found (though it should be if called correctly)
  container.innerHTML = '';
  
  if (workExperienceData && workExperienceData.length > 0) {
    workExperienceData.forEach(experience => {
      const experienceDiv = document.createElement('div');
      experienceDiv.classList.add('card','mb-[2.5%]','lg:mb-[0%]');

      const headingPara = document.createElement('p');
          const companyHeading = document.createElement('span');
          companyHeading.classList.add('montserrat-regular','text-sm','md:text-md','lg:text-lg');
          companyHeading.textContent = experience.Company;
          const companyLocation = document.createElement('span');
          companyLocation.classList.add('montserrat-light','text-sm','md:text-md','lg:text-lg');
          companyLocation.textContent = `, ${experience.Location}`;
          headingPara.appendChild(companyHeading);
          headingPara.appendChild(companyLocation);
       
      const rolePara = document.createElement('p');
          rolePara.classList.add('mt-3');
          const role =document.createElement('span');
          role.classList.add('montserrat-regular','text-xs','md:text-sm','lg:text-md');
          role.textContent = 'Designation: ';
          const roleDesc = document.createElement('span');
          roleDesc.classList.add('montserrat-light', 'text-xs','md:text-sm','lg:text-md');
          roleDesc.textContent = experience.Role;
          rolePara.appendChild(role);
          rolePara.appendChild(roleDesc);

      const durationPara = document.createElement('p');
      durationPara.classList.add('montserrat-extralight', 'text-xs','md:text-sm','lg:text-md','mt-3');
      const to_month_year = experience.to_month_year ? ' to ' + experience.to_month_year : ' to Present'
      durationPara.textContent = `${experience.from_month_year}${to_month_year}`;

      const responsibilitiesPara = document.createElement('p');
        responsibilitiesPara.classList.add('mt-3');
        const responsibilitiesParagraph = document.createElement('span');
        responsibilitiesParagraph.classList.add('montserrat-light','text-xs','md:text-sm','lg:text-md');
        responsibilitiesParagraph.innerHTML = `${experience.responsibilities}`;
        responsibilitiesPara.appendChild(responsibilitiesParagraph);

      experienceDiv.appendChild(headingPara);
      experienceDiv.appendChild(durationPara);
      experienceDiv.appendChild(rolePara);
      experienceDiv.appendChild(responsibilitiesPara);
      
      container.appendChild(experienceDiv);
    });
  } else {
    container.textContent = 'No work experience data available.';
  }
}

function displayEducation(educationData, containerId) {
  const container = document.getElementById(containerId); // Re-select inside here
  if (!container) return;
  container.innerHTML = '';
  
  if (educationData && educationData.length > 0) {
    educationData.forEach(education => {
      const educationDiv = document.createElement('div');
      educationDiv.classList.add('w-full','text-center','flex','mb-10','px-[2%]');
      
      const collegeDiv = document.createElement('div');
      const line = document.createElement('div');
      line.classList.add('border-r-1','border-seashell','mx-[2%]');
      const yearsDiv = document.createElement('div');

      collegeDiv.classList.add('left');
      yearsDiv.classList.add('right');        
      
          const headingPara = document.createElement('p');
          headingPara.classList.add('monserrat-regular','text-md','md:text-base','lg:text-lg','tracking-wider');
          headingPara.textContent = education.institution_name;

          const degreePara = document.createElement('p');
          degreePara.classList.add('montserrat-light','mt-2','text-sm','md:text-md','lg:text-base')
          degreePara.textContent = `${education.degree_program_certificate}`;

          const scorePara = document.createElement('p');
          scorePara.classList.add('montserrat-light','mt-2','text-sm','md:text-md','lg:text-base');
          scorePara.textContent = `${education.score_type}: ${education.score} / ${education.score_on_scale}`;

          const durationPara = document.createElement('p');
          durationPara.classList.add('montserrat-extralight','text-md','md:text-base','lg:text-lg');
          const to_month_year = education.to_month_year ? ' to ' + education.to_month_year : ' to Present'
          durationPara.textContent = `${education.from_month_year}${to_month_year}`;

      collegeDiv.appendChild(headingPara);
      collegeDiv.appendChild(degreePara);
      collegeDiv.appendChild(scorePara);
      
      yearsDiv.appendChild(durationPara);

        educationDiv.appendChild(collegeDiv);
        educationDiv.appendChild(line);
        educationDiv.appendChild(yearsDiv);
      
      container.appendChild(educationDiv);
    });
  } else {
    container.textContent = 'No education data available.';
  }
}

function displayProjects(projectsData, containerId) {
  const container = document.getElementById(containerId); // Re-select inside here
  if (!container) return;
  container.innerHTML = '';

  if (projectsData && projectsData.length > 0) {
    projectsData.forEach(project => {
      const projectDiv = document.createElement('div');
      projectDiv.classList.add('project-card');

      const projectType = document.createElement('p');
      projectType.classList.add('montserrat-extralight-i','text-xs','md:text-sm','lg:text-md');
      projectType.textContent = `${project.type} project`;

      const projectTitle = document.createElement('p');
      projectTitle.classList.add('montserrat-regular','text-sm','md:text-md','lg:text-lg');
      projectTitle.textContent = project.project_title;
      
      const domain = document.createElement('p');
      domain.classList.add('montserrat-light','my-[0.5%]','text-sm','md:text-md','lg:text-lg');
      domain.textContent = project.course_or_domain;

      const description = document.createElement('p');
      description.classList.add('montserrat-extralight','text-sm','md:text-md','lg:text-lg');
      description.textContent = project.project_description;

      projectDiv.appendChild(projectType);
      projectDiv.appendChild(projectTitle);
      projectDiv.appendChild(domain);
      projectDiv.appendChild(description);
      
      container.appendChild(projectDiv);
    });
  } else {
    container.textContent = 'No project data available.';
  }
}

function displayInterestAreas(interestAreasData, containerId) {
  const container = document.getElementById(containerId); // Re-select inside here
  if (!container) return;
  container.innerHTML = '';

  if (interestAreasData && interestAreasData.length > 0) {
    interestAreasData.forEach(interest => {
      const interestsDiv = document.createElement('div');
      interestsDiv.classList.add('my-[2.5%]','montserrat-light-i','text-seashell','text-sm','md:text-md','lg:text-lg');
      interestsDiv.textContent = `> ${interest.interest_area}`;      
      container.appendChild(interestsDiv);
    });
  } else {
    container.textContent = 'No areas of interests data available.';
  }
}

function displayExtracurricularActivities(extracurricularActivitiesData, containerId) {
  const container = document.getElementById(containerId); // Re-select inside here
  if (!container) return;
  container.innerHTML = '';
  container.classList.add('text-center','text-gray-800');

  let cntr = 0;
  const dataLen = extracurricularActivitiesData.length;
  if (extracurricularActivitiesData && extracurricularActivitiesData.length > 0) {
    extracurricularActivitiesData.forEach(activityItem => {
      const activity_li = document.createElement('div');
      activity_li.classList.add('montserrat-regular','text-sm','md:text-md','lg:text-base');
      activity_li.innerHTML = activityItem.activity;      
     
      const bottomSeparator = document.createElement('hr');
      bottomSeparator.classList.add('w-[10%]','mx-auto','my-[4%]','opacity-70','border-gray-400');
      
      container.appendChild(activity_li);
      if(cntr < dataLen-1) { container.appendChild(bottomSeparator); }
      cntr++;
    
    });
  } else {
    container.textContent = 'No extracurriular activity data available.';
  }
}

function displayPOR(porData, containerId) {
  const container = document.getElementById(containerId); // Re-select inside here
  if (!container) return;
  container.innerHTML = '';
  container.classList.add('text-center','text-gray-800');

  let cntr = 0;
  const portDataLen = porData.length;
  if (porData && porData.length > 0) {
    porData.forEach(porItem => {
      const por_li = document.createElement('div');
      
      const por_title = document.createElement('p');
      por_title.classList.add('montserrat-regular','text-sm','md:text-md','lg:text-base');
      por_title.textContent = `${porItem.por} (${porItem.from_year} - ${porItem.to_year})`;

      const por_club = document.createElement('p');
      por_club.classList.add('montserrat-light','text-sm','md:text-md','lg:text-base');
      por_club.textContent = porItem.club_group;

      const por_institution = document.createElement('p');
      por_institution.classList.add('montserrat-light','text-sm','md:text-md','lg:text-base');
      por_institution.textContent = porItem.institution;
      
      const bottomSeparator = document.createElement('hr');
      bottomSeparator.classList.add('w-[10%]','mx-auto','my-[4%]','opacity-70','border-gray-400');

      por_li.appendChild(por_title);
      por_li.appendChild(por_club);
      por_li.appendChild(por_institution);
      if(cntr < portDataLen-1) { por_li.appendChild(bottomSeparator); }
      cntr++;
      container.appendChild(por_li);
    });
  } else {
    container.textContent = 'No POR data available.';
  }
}

function displaySkills(skillsData, containerId) {
  const container = document.getElementById(containerId); // Re-select inside here
  if (!container) return;
  container.innerHTML = '';

  if (skillsData && skillsData.length > 0) {
    skillsData.forEach(skill => {
      const skillsDiv = document.createElement('div');
      skillsDiv.classList.add('my-[7.5%]');

      const skillType = document.createElement('p');
      skillType.classList.add('montserrat-regular','text-sm','md:text-md','lg:text-lg');
      skillType.textContent = skill.type;
      
      // Create a list for specific skills
      const specificListDiv = document.createElement('div');
      specificListDiv.classList.add('montserrat-light-i','ml-[3%]','mt-[1%]','text-sm','md:text-md','lg:text-lg'); // Indent the list

      if (skill.specific_list && skill.specific_list.length > 0) {
        skill.specific_list.forEach(name => {
          const skillItem = document.createElement('p');
          skillItem.textContent = name;
          specificListDiv.appendChild(skillItem);
        });
      } else {
        const noSkillsMessage = document.createElement('p');
        noSkillsMessage.textContent = "No specific skills listed for this category.";
        specificListDiv.appendChild(noSkillsMessage);
      }

      skillsDiv.appendChild(skillType);
      skillsDiv.appendChild(specificListDiv);
      
      container.appendChild(skillsDiv);
    });
  } else {
    container.textContent = 'No skill data available.';
  }
}

function displayPublication(publicationData, containerId) {
  const container = document.getElementById(containerId); // Re-select inside here
  if (!container) return;
  container.innerHTML = '';

  if (publicationData && publicationData.length > 0) {
    publicationData.forEach(publication => {
      const publicationDiv = document.createElement('div');
      publicationDiv.classList.add('text-seashell','rounded-md','text-center','items-center','p-[3%]');

              const topSeparator = document.createElement('hr');
              topSeparator.classList.add('w-[40%]','mx-auto','mb-[5%]','opacity-50');

              const paperTitle = document.createElement('p');
              paperTitle.classList.add('montserrat-regular','text-sm','md:text-md','lg:text-lg','mb-[1%]');
              paperTitle.textContent = publication.title;

              const paperPublication = document.createElement('p');
              paperPublication.classList.add('montserrat-light', 'mb-[1%]','text-sm','md:text-md','lg:text-lg');
              paperPublication.textContent = publication.conference_journal_name;

              const bookSeries = document.createElement('p');
              bookSeries.classList.add('montserrat-light', 'mb-[1%]','text-sm','md:text-md','lg:text-lg');
              bookSeries.textContent = `Book series: ${publication.book_series}`;

      publicationDiv.appendChild(topSeparator);
      publicationDiv.appendChild(paperTitle);
      publicationDiv.appendChild(paperPublication);
      publicationDiv.appendChild(bookSeries);

      container.appendChild(publicationDiv);
    });
  } else {
    container.textContent = 'No publication data available.';
  }
}
// ------------ End of helper functions for my data --------------------------

// ------------ Helper functions for Illustration Gallery --------------------

/**
 * Asynchronously fetches image filenames from the upload service API
 * and displays them in a specified HTML container as interactive cards.
 * Each card includes the image, an option to open the image in a new tab,
 * and a delete button to remove the image.
 *
 * string parameter [containerId='image-gallery'] - The ID of the HTML element
 * where the image cards should be appended. Defaults to 'image-gallery'.
 */
// async function displayUploadedImagesForAdmin(containerId = 'image-gallery') {
//   let apiURL = `${PUBLIC_IP}:${UPLOAD_SERVICE_PORT}/upload-service-api/getFileNames`; // API to get list of filenames
//   let imageBaseURL = `${PUBLIC_IP}:${UPLOAD_SERVICE_PORT}/images/`;  // Base URL for accessing the images themselves
//   if(PROD){
//     apiURL = `/upload-service-api/getFileNames`;
//     imageBaseURL = `/images/`;
//   }

//   const imageContainer = document.getElementById(containerId);

//   // Ensure the container element exists in the DOM
//   if (!imageContainer) {
//       console.error(`Error: An HTML element with ID '${containerId}' was not found. Please add it to your page.`);
//       return;
//   }

//   // Clear any existing content in the image container and show a loading message
//   imageContainer.innerHTML = '<p class="text-gray-500 montserrat-light-i text-center">Loading images...</p>';

//   try {
//     // 1. Fetch the list of image filenames from the backend API
//     const response = await fetch(apiURL);
//     if (!response.ok) {
//         // If the HTTP response status is not 2xx, throw an error
//         throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
//     }

//     let imageFileNames = await response.json(); // Parse the JSON response into an array of filenames

//     // Clear the loading message after successful fetch
//     imageContainer.innerHTML = '';

//     // Check if the array of filenames is empty
//     if (!imageFileNames || imageFileNames.length === 0) {
//         imageContainer.innerHTML = '<p class="text-gray-500 montserrat-light-i text-center">No images found on the server.</p>';
//         return; // Exit if no images are found
//     }

//     ////console.log('Image file names fetched:', imageFileNames);
//     imageFileNames = imageFileNames.reverse();

//     // 2. Loop over the obtained list and dynamically create/display each image card
//     imageFileNames.forEach(fileName => {
//       // Create a div for the card
//       const card = document.createElement('div');
//       //card.className = 'image-card'; // Add a class for styling
//       //card.classList.add('card','mb-[2.5%]','lg:mb-[0%]');
//       card.classList.add('illustration-card','group','relative');
      
//       // ------------- Create the image element
//       const img = document.createElement('img');
//       img.src = imageBaseURL + fileName;
//       img.alt = `Image: ${fileName}`; // Good for accessibility
//       img.loading = 'lazy'; // Improve performance by lazy-loading images
//       img.classList.add(
//         'w-full', 'h-full', 'object-cover','transition-all',
//         'duration-300', 'ease-in-out', 'group-hover:scale-110', 'cursor-pointer');
//       //Add onclick event listener to the image
//       img.onclick = () => {
//         // Open the image in a new tab
//         window.open(img.src, '_blank');
//         };

//       // ------------- Create the delete button (an 'x' icon)
//       const deleteButton = document.createElement('button');
//       deleteButton.classList.add('absolute', 'top-1', 'left-1', 'z-10',
//       'bg-red-500', 'text-white', 'rounded-full', 'w-7', 'h-7', 'flex', 'items-center', 'justify-center', 'text-sm', 'font-bold',
//       'opacity-0', 'shadow-md', 'group-hover:opacity-80', 'transition-opacity', 'duration-200',
//       'cursor-pointer', 'hover:bg-red-700');
//       deleteButton.textContent = "x"; // The 'x' text
      
//       // Add click event listener to the delete button
//       deleteButton.onclick = async () => {

//             // ------- check if the session is still active -------------
//           const sessionIsValidBackend = await isSessionValid(); 
//           if(!sessionIsValidBackend){
//             await setExpiryTimestampToZero();
//             //console.log("session is expired");
//             const illustrationGalleryTabToggle = document.querySelector('.tabs__toggle[data-tab-target="illustrations_tab_content_for_admin.html"]');
//             if (illustrationGalleryTabToggle) {
//               illustrationGalleryTabToggle.dataset.tabTarget = "illustrations_tab_content.html";
//               //console.log("data-tab-target changed to:", illustrationGalleryTabToggle.dataset.tabTarget);
//             } else {
//               console.error("Illustration Gallery tab toggle element not found!");
//             }
//             illustrationGalleryTabToggle.click();
//             return;
//           }
//           else{
//             //console.log("session is active, you may proceed to delete the image.");
//           }

//         //console.log(`Attempting to delete image: ${fileName}`);
//         try {
//             let deleteApiUrl = `${UPLOAD_SERVICE_API_URL}/upload-service-api/deleteImage/${fileName}`;
//             if(PROD){
//               deleteApiUrl = `/upload-service-api/deleteImage/${fileName}`;
//             }

//             //console.log('DELETE request to:', deleteApiUrl);

//             const response = await fetch(deleteApiUrl, {
//                 method: 'DELETE',
//             });

//             if (response.ok) {
//                 const result = await response.text(); // Assuming backend sends text response
//                 //console.log(`Successfully deleted ${fileName}:`, result);
//                 card.remove(); // Remove the card from the DOM immediately upon successful deletion
//             } else {
//                 const errorText = await response.text();
//                 throw new Error(`Failed to delete ${fileName}: ${response.status} - ${errorText}`);
//             }
//         } catch (error) {
//             console.error('Error deleting image:', error);
//         }
//     };

//       // Append image and text to the card
//       card.appendChild(img);
//       card.appendChild(deleteButton);

//       // Append the card to the main container
//       imageContainer.appendChild(card);
//       });

//   } catch (error) {
//       // Catch and log any errors that occurred during the fetch or processing
//       console.error('Failed to fetch image names or display images:', error);
//       imageContainer.innerHTML = `<p class="text-red-500 montserrat-light-i text-center">Error loading images: ${error.message}</p>`;
//   }
// }

/**
 * Asynchronously fetches image filenames from the upload service API
 * and displays them in a specified HTML container as interactive cards.
 * Each card includes the image, an option to open the image in a new tab.
 *
 * string parameter [containerId='image-gallery'] - The ID of the HTML element
 * where the image cards should be appended. Defaults to 'image-gallery'.
 */
// async function displayUploadedImages(containerId = 'image-gallery') {
//   let apiURL = `${PUBLIC_IP}:${UPLOAD_SERVICE_PORT}/upload-service-api/getFileNames`; // API to get list of filenames
//   let imageBaseURL = `${PUBLIC_IP}:${UPLOAD_SERVICE_PORT}/images/`;  // Base URL for accessing the images themselves
//   if(PROD)
//   { apiURL = `/upload-service-api/getFileNames`;
//     imageBaseURL = `/images/`;
//   }

//   const imageContainer = document.getElementById(containerId);

//   // Ensure the container element exists in the DOM
//   if (!imageContainer) {
//       console.error(`Error: An HTML element with ID '${containerId}' was not found. Please add it to your page.`);
//       return;
//   }

//   // Clear any existing content in the image container and show a loading message
//   imageContainer.innerHTML = '<p class="text-gray-500 montserrat-light-i text-center">Loading images...</p>';

//   try {
//     // 1. Fetch the list of image filenames from the backend API
//     const response = await fetch(apiURL);
//     if (!response.ok) {
//         // If the HTTP response status is not 2xx, throw an error
//         throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
//     }

//     let imageFileNames = await response.json(); // Parse the JSON response into an array of filenames

//     // Clear the loading message after successful fetch
//     imageContainer.innerHTML = '';

//     // Check if the array of filenames is empty
//     if (!imageFileNames || imageFileNames.length === 0) {
//         imageContainer.innerHTML = '<p class="text-gray-500 montserrat-light-i text-center">No images found on the server.</p>';
//         return; // Exit if no images are found
//     }

//     //console.log('Image file names fetched:', imageFileNames);
//     imageFileNames = imageFileNames.reverse();
//     // 2. Loop over the obtained list and dynamically create/display each image card
//     imageFileNames.forEach(fileName => {
//       // Create a div for the card
//       const card = document.createElement('div');
//       //card.className = 'image-card'; // Add a class for styling
//       //card.classList.add('card','mb-[2.5%]','lg:mb-[0%]');
//       card.classList.add('illustration-card','group','relative');
      
//       // ------------- Create the image element
//       const img = document.createElement('img');
//       img.src = imageBaseURL + fileName;
//       img.alt = `Image: ${fileName}`; // Good for accessibility
//       img.loading = 'lazy'; // Improve performance by lazy-loading images
//       img.classList.add(
//         'w-full', 'h-full', 'object-cover','transition-all',
//         'duration-300', 'ease-in-out', 'group-hover:scale-110', 'cursor-pointer');
//       //Add onclick event listener to the image
//       img.onclick = () => {
//         // Open the image in a new tab
//         window.open(img.src, '_blank');
//         };

//       // Append image and text to the card
//       card.appendChild(img);
     
//       // Append the card to the main container
//       imageContainer.appendChild(card);
//       });

//   } catch (error) {
//       // Catch and log any errors that occurred during the fetch or processing
//       console.error('Failed to fetch image names or display images:', error);
//       imageContainer.innerHTML = `<p class="text-red-500 montserrat-light-i text-center">Error loading images: ${error.message}</p>`;
//   }
// }

// ------------ End of helper functions for Illustration Gallery -------------

// ------------ Helper functions for login operations ------------------------

/**
 * Updates the title and content of the login panel.
 * param {string} title - The title to display in the panel header.
 * param {string} htmlContent - The HTML string to set as the panel's main content.
 */
// function setPanelContent(title, htmlContent) {
//   const panelTitle = document.getElementById('panelTitle');
//   const panelContent = document.getElementById('panelContent');
//   const messageArea = document.getElementById('messageArea');

//   panelTitle.textContent = title;
//   panelContent.innerHTML = htmlContent;
//   messageArea.textContent = ''; // Clear message area whenever content changes
//   messageArea.classList.remove('text-red-600', 'text-green-600', 'text-blue-600');
//   messageArea.style.color = ''; // Clear direct style color
// }

/**
 * Displays a message in the messageArea with appropriate styling.
 * param {'success' | 'error' | 'info' | 'loading'} type - The type of message.
 * param {string} message - The message text.
 */
// function displayPanelMessage(type, message) {
//   const messageArea = document.getElementById('messageArea');

//   messageArea.textContent = message;
//   messageArea.classList.remove('text-red-600', 'text-green-600', 'text-blue-600'); // Clear all previous colors
//   messageArea.style.color = ''; // Clear any direct style color

//   switch (type) {
//       case 'success':
//           messageArea.classList.add('text-green-400'); // Light green
//           messageArea.style.color = '#4ade80'; // Fallback for direct style if needed
//           break;
//       case 'error':
//           messageArea.classList.add('text-red-600');
//           break;
//       case 'info':
//           messageArea.classList.add('text-gray-600'); // Or text-blue-500
//           break;
//       case 'loading':
//           messageArea.classList.add('text-blue-600');
//           break;
//       default:
//           messageArea.classList.add('text-gray-600');
//   }
// }

/**
 * Sets the disabled state of a button.
 * param {HTMLButtonElement} buttonElement - The button element to modify.
 * param {boolean} isDisabled - True to disable, false to enable.
 */
// function setButtonState(buttonElement, isDisabled) {
//   if (buttonElement) {
//       buttonElement.disabled = isDisabled;
//       if (isDisabled) {
//           buttonElement.classList.add('opacity-50', 'cursor-not-allowed');
//       } else {
//           buttonElement.classList.remove('opacity-50', 'cursor-not-allowed');
//       }
//   }
// }

// Function to display the first window (Email input)
// function showEmailWindow() {
//   setPanelContent(
//       'Enter Admin Email',
//       `
//       <input type="email" id="adminEmailInput" placeholder="admin@example.com" class="w-full p-2 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
//       <button id="submitEmailButton" class="w-full px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition-colors">Submit Email</button>
//       `
//   );
//   document.getElementById('adminEmailInput').focus();

//   document.getElementById('submitEmailButton').addEventListener('click', async () => {
//       const emailInput = document.getElementById('adminEmailInput');
//       adminEmail = emailInput.value.trim();

//       if (adminEmail === '') {
//           displayPanelMessage('error', 'Please enter an email address.');
//           return;
//       }

//       displayPanelMessage('loading', 'Verifying email...');
//       const submitButton = document.getElementById('submitEmailButton');
//       setButtonState(submitButton, true);

//       try {
//           // --- STEP 1: Verify if it's an admin email ---
//           let isAdminApiUrl = `${PUBLIC_IP}:${UPLOAD_SERVICE_PORT}/upload-service-api/isAdminEmail/${adminEmail}`;
//           if(PROD){
//             isAdminApiUrl = `/upload-service-api/isAdminEmail/${adminEmail}`;
//           }

//           const isAdminResponse = await fetch(isAdminApiUrl);
//           const isAdminData = await isAdminResponse.json();

//           if (!isAdminResponse.ok || !isAdminData.success) {
//               displayPanelMessage('error', 'Invalid email ID.');
//               console.error('Admin email check failed:', isAdminData.message || 'Unknown error');
//               return;
//           }
          
//           // --- STEP 2: If email is admin, proceed to send OTP ---
//           displayPanelMessage('success', 'Email verified. Sending OTP...');
//           let apiUrl = `${PUBLIC_IP}:${UPLOAD_SERVICE_PORT}/upload-service-api/sendOTP/${adminEmail}`;
//           if(PROD){
//             apiUrl = `/upload-service-api/sendOTP/${adminEmail}`;
//           }

//           const response = await fetch(apiUrl);
//           const data = await response.json();

//           if (response.ok) {
//               //console.log('OTP API Response:', data);
//               displayPanelMessage('success', `OTP sent to ${adminEmail}.`);
//               showOtpWindow(); // Move to the OTP window
//           } else {
//               displayPanelMessage('error', `Error: ${data.message || 'Failed to send OTP'}`);
//               console.error('API Error:', data);
//           }
//       } catch (error) {
//           displayPanelMessage('error', `Network error: ${error.message}. Is backend server running?`);
//           console.error('Fetch Error:', error);
//       } finally {
//           setButtonState(submitButton, false);
//       }
//   });
// }

// Function to display the second window (OTP input)
// function showOtpWindow() {
//   setPanelContent(
//       'Enter OTP',
//       `
//       <p class="text-sm text-gray-600 mb-3">An OTP has been sent to <strong>${adminEmail}</strong></p>
//       <input type="text" id="otpInput" placeholder="Enter 5-digit OTP" maxlength="5" class="w-full p-2 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400">
//       <button id="verifyOtpButton" class="w-full px-4 py-2 bg-green-600 text-white rounded-md cursor-pointer hover:bg-green-700 transition-colors">Verify OTP</button>
//       `
//   );
//   document.getElementById('otpInput').focus();

//   document.getElementById('verifyOtpButton').addEventListener('click', async () => {
//       const otpInput = document.getElementById('otpInput');
//       const otpValue = otpInput.value.trim();
//       const verifyButton = document.getElementById('verifyOtpButton');
      
//       if (otpValue.length !== 5 || isNaN(otpValue)) {
//           displayPanelMessage('error', 'Please enter a valid 5-digit OTP.');
//           return;
//       }

//       displayPanelMessage('loading', 'Verifying OTP...');
//       setButtonState(verifyButton, true);

//       try {
//           // --- Call the /upload-service-api/OTPverify API ---
//           let verifyApiUrl = `${PUBLIC_IP}:${UPLOAD_SERVICE_PORT}/upload-service-api/OTPverify/${otpValue}`;
//           if(PROD){
//             verifyApiUrl = `/upload-service-api/OTPverify/${otpValue}`;
//           }

//           const response = await fetch(verifyApiUrl);
//           const data = await response.json();

//           if (response.ok && data.success) {
//               displayPanelMessage('success', `OTP verified successfully! Welcome.`);
//               //console.log('Server-side verification SUCCESS!');
              
//               // Await the asynchronous function call and capture its success
//               const timestampAdded = await storeExpiryTimestamp();

//               // Add a console message based on the result
//               if (timestampAdded) {
//                   //console.log("Server-side timestamp successfully added/updated.");
//               } else {
//                   console.error("Failed to add/update server-side timestamp.");
//               }

//               const illustrationGalleryTabToggle = document.querySelector('.tabs__toggle[data-tab-target="illustrations_tab_content.html"]');
//               if (illustrationGalleryTabToggle) {
//                 illustrationGalleryTabToggle.dataset.tabTarget = "illustrations_tab_content_for_admin.html";
//                 //console.log("data-tab-target changed to:", illustrationGalleryTabToggle.dataset.tabTarget);
//               } else {
//                 console.error("Illustration Gallery tab toggle element not found!");
//               }
//               illustrationGalleryTabToggle.click();
              
//               setTimeout(closePanel, 2000);

//           } else {
//               displayPanelMessage('error', `${data.message || 'Please try again.'}. Please close the login window and retry`);
//               console.error('Server-side verification FAILED:', data.message || 'No message');
//               otpInput.value = '';
//           }
//       } catch (error) {
//           displayPanelMessage('error', `Network error during verification: ${error.message}. Is backend server running?`);
//           console.error('Fetch Error:', error);
//       } finally {
//           setButtonState(verifyButton, false);
//       }
//   });
// }

// Function to close the panel
// function closePanel() {
//   const loginPanel = document.getElementById('loginPanel');

//   if (loginPanel) { // Ensure panel exists before attempting to hide
//       loginPanel.classList.add('hidden');
//   }
//   //setPanelContent('Login', ''); // Reset title and clear content
//   //adminEmail = ''; // Reset email
// }

// ------------ End of helper functions for login ops ---------------------------

// ======================= DOMContentLoaded Listener ============================
document.addEventListener('DOMContentLoaded', async () => {

  //console.log('DOMContentLoaded: Page loaded, starting initialization.');

  await Promise.all([
    fetchAndDisplayProperty('name', 'name-display'),
    fetchAndDisplayProperty('summary', 'summary-display'),
    fetchAndReturnLink('email_id', 'email_id-link'),
    fetchAndReturnLink('linkedin', 'linkedin-link'),
    fetchAndReturnLink('github', 'github-link'),
    fetchAndReturnLink('resume', 'resume-link'),
  ]);
  
  // Add event listeners to tab toggles
  tabToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      tabToggles.forEach(t => t.classList.remove('is-active', 'bg-amber-200')); // Remove active classes from all toggles
      toggle.classList.add('is-active', 'bg-amber-200'); // Add active classes to the clicked toggle
      const targetHtmlFile = toggle.dataset.tabTarget; // Get the target HTML file path from data-tab-target
      loadTabContent(targetHtmlFile); // Load the content for the clicked tab
    });
  });

  // Initial load: Simulate a click on the default active tab ('My Info') on page load.
  // This will trigger loadTabContent and subsequently initializeMyInfoContent.
  const defaultTab = document.querySelector('.tabs__toggle.is-active');
  if (defaultTab) {
    defaultTab.click();
  }

  //const tsEntryExists = await doesVariableExistInCache(); // Await the async call
  // if (tsEntryExists) {
  //   const sessionIsValid = await isSessionValid(); // Await the async call
  //   if(sessionIsValid)
  //   { //console.log("Session still active");
  //     const illustrationGalleryTabToggle = document.querySelector('.tabs__toggle[data-tab-target="illustrations_tab_content.html"]');
  //     if (illustrationGalleryTabToggle) {
  //       illustrationGalleryTabToggle.dataset.tabTarget = "illustrations_tab_content_for_admin.html";
  //       //console.log("data-tab-target changed to:", illustrationGalleryTabToggle.dataset.tabTarget);
  //     } else {
  //       console.error("Illustration Gallery tab toggle element not found!");
  //     }
  //   }
  //   else
  //   { await setExpiryTimestampToZero(); 
  //     //console.log("Session expired");    
  //   }    
  // } else {
  //     //console.log("No active sessions");
  //     await setExpiryTimestampToZero(); 
  // }
});

// --------------- Specific Initialization Functions for Each Tab ---------------

// This function contains all JavaScript logic for the "My Info" tab content
async function initializeMyInfoContent() {
  //console.log("Initializing My Info tab content...");
  
  // Fetch and display card categories
  await Promise.all([
    fetchAndDisplayCards('work_exp', 'work-experience-container', displayWorkExperience),
    fetchAndDisplayCards('education', 'education-container', displayEducation),
    fetchAndDisplayCards('projects', 'projects-container', displayProjects),
    fetchAndDisplayCards('technical_skills', 'skills-container', displaySkills),
    fetchAndDisplayCards('areas_of_interest', 'areas-of-interest-container', displayInterestAreas),
    fetchAndDisplayCards('publication', 'publication-container', displayPublication),
    fetchAndDisplayCards('extracurricular_activities', 'extracurricular-container', displayExtracurricularActivities),
    fetchAndDisplayCards('positions_of_responsibilities', 'por-container', displayPOR)
  ]);
}

// This function contains all JavaScript logic for the "Illustration Gallery" tab content
// It is now simplified to reflect the minimal content of illustrations_tab_content_for_admin.html
// async function initializeIllustrationFormAndGallery() {
  
//   // ------------------- upload image form and its operations ---------------------------------
//   //console.log("Initializing Illustration Gallery tab content for admin.");
//   const uploadForm = document.getElementById('uploadForm');
//   const uploadResponseDiv = document.getElementById('uploadResponse');
//   const imageUploadInput = document.getElementById('imageUpload');
//   const fileNameDisplay = document.getElementById('fileNameDisplay');
  
//   // Update file name display when a file is chosen
//   imageUploadInput.addEventListener('change', (event) => {
//     if (event.target.files.length > 0) {
//         fileNameDisplay.textContent = event.target.files[0].name;
//     } else {
//         fileNameDisplay.textContent = 'No file chosen';
//     }
//   });

//   uploadForm.addEventListener('submit', async (event) => {
//       event.preventDefault(); // Prevent the default form submission (page reload)
//       //console.log("Upload form submitted!");
//       // ------- check if the session is still active -------------
//       const sessionIsValid = await isSessionValid(); 
//       if(!sessionIsValid){
//         await setExpiryTimestampToZero();
//         //console.log("session is expired");
//         const illustrationGalleryTabToggle = document.querySelector('.tabs__toggle[data-tab-target="illustrations_tab_content_for_admin.html"]');
//         if (illustrationGalleryTabToggle) {
//           illustrationGalleryTabToggle.dataset.tabTarget = "illustrations_tab_content.html";
//           //console.log("data-tab-target changed to:", illustrationGalleryTabToggle.dataset.tabTarget);
//         } else {
//           console.error("Illustration Gallery tab toggle element not found!");
//         }
//         illustrationGalleryTabToggle.click();
//         return;
//       }
//       else{
//         //console.log("session is active, you may upload the illustration");
//       }

//       // Clear previous response message
//       uploadResponseDiv.textContent = '';
//       uploadResponseDiv.style.color = 'black'; // Reset color

//       // Check if a file is selected
//       if (imageUploadInput.files.length === 0) {
//           //console.log('Please select an image to upload.');
//           uploadResponseDiv.style.color = 'red';
//           uploadResponseDiv.textContent = 'Please select an image to upload.';
//           return;
//       }

//       const formData = new FormData();
//       formData.append('myImage', imageUploadInput.files[0]); // 'myImage' must match the name in multer.single()

//       try {
//           // Make the POST request to the backend's upload endpoint
//           let apiUrl = `${PUBLIC_IP}:${UPLOAD_SERVICE_PORT}/upload-service-api/upload`; 
//           if(PROD){
//             apiUrl = `/upload-service-api/upload`;
//           }

//           const response = await fetch(apiUrl, {
//               method: 'POST',
//               body: formData // No Content-Type header needed for FormData; fetch sets it automatically
//           });

//           const message = await response.text(); // Get the response text (success or error message)

//           if (response.ok) {
//               uploadResponseDiv.style.color = 'green';
//               uploadResponseDiv.textContent = 'Upload successful: ' + message;
//               imageUploadInput.value = '';
//               uploadForm.reset(); // Clear form
//               fileNameDisplay.textContent = 'No file chosen';
//               displayUploadedImagesForAdmin(); // Refresh the gallery
//           } else {
//               uploadResponseDiv.style.color = 'red';
//               uploadResponseDiv.textContent = 'Upload failed: ' + message;
//           }
//       } catch (error) {
//           console.error('Network error during upload:', error);
//           uploadResponseDiv.style.color = 'red';
//           uploadResponseDiv.textContent = 'Network error: Could not reach the backend.';
//       }
//   });
//   // ------------------ end of upload image form and its operations ---------------------------
  
//   // ------------------ log out button and its actions -------------------------------------
//   const logoutButton = document.getElementById('logoutButton'); 

//   logoutButton.addEventListener('click', async () => {
//     //console.log("Log Out button clicked!");
//     // ------- check if the session is still active -------------
//     await setExpiryTimestampToZero();
//     //console.log("Logged out");
//       const illustrationGalleryTabToggle = document.querySelector('.tabs__toggle[data-tab-target="illustrations_tab_content_for_admin.html"]');
//       if (illustrationGalleryTabToggle) {
//         illustrationGalleryTabToggle.dataset.tabTarget = "illustrations_tab_content.html";
//         //console.log("data-tab-target changed to:", illustrationGalleryTabToggle.dataset.tabTarget);
//       } else {
//         console.error("Illustration Gallery tab toggle element not found!");
//       }
//       illustrationGalleryTabToggle.click();
//       return;
//   });
//   // ------------------ display uploaded images --------------------------
//   await displayUploadedImagesForAdmin();
// }

// This function contains all JavaScript logic for the "Illustration Gallery" tab content
// It is now simplified to reflect the minimal content of illustrations_tab_content.html
// async function initializeIllustrationGallery() {
  
//   // ------------------- upload image form and its operations ---------------------------------
//   //console.log("Initializing Illustration Gallery tab content for general user.");
  
//   // ------------------ display uploaded images --------------------------
//   await displayUploadedImages();

//   // ------------------ login routine ------------------------------------
//   const openLoginButton = document.getElementById('openLoginButton');
//   const closePanelButton = document.getElementById('closePanelButton'); // Get the close button
//   const loginPanel = document.getElementById('loginPanel');

//   // Event listener for the initial "Open Login" button
//   if (openLoginButton) {
//     openLoginButton.addEventListener('click', () => {
//         if (loginPanel) {
//             loginPanel.classList.remove('hidden'); // Show the panel
//         }
//         showEmailWindow(); // Start with the email window
//     });
//   }

//   // Event listener for the close button within the panel
//   if (closePanelButton) {
//     closePanelButton.addEventListener('click', closePanel);
//   }

// }