// scrolling transitions
// Keep data rendering independent from animation libraries.
if (window.Lenis && window.gsap && window.ScrollTrigger) {
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
} else {
  console.warn('Animation libraries unavailable; continuing without smooth scroll.');
}

//---------------

// Global elements that are *always* present in index.html (not inside dynamic tabs)
const loaderContainer = document.querySelector('#loader-container');
const pageContent = document.querySelector('#page-content');
const topBox = document.querySelector('#top-box'); // Header element
const mainContent = document.querySelector('main'); // Main content area

// IMPORTANT: Main container for dynamically loaded tab content
const tabsContentContainer = document.getElementById('tabs-content-container');
const tabToggles = document.querySelectorAll('.tabs__toggle');

// Local JSON data paths (static site — no backend server)
const METADATA_URL = './backend/metadata.json';
const DATA_URL = './backend/data.json';

let metadataCache = null;
let dataCache = null;

async function loadMetadata() {
  if (window.location.protocol === 'file:') {
    throw new Error('Open via a local server (for example: python3 -m http.server 8080).');
  }
  if (!metadataCache) {
    const response = await fetch(METADATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to load metadata: ${response.statusText}`);
    }
    const json = await response.json();
    metadataCache = json[0];
  }
  return metadataCache;
}

async function loadData() {
  if (window.location.protocol === 'file:') {
    throw new Error('Open via a local server (for example: python3 -m http.server 8080).');
  }
  if (!dataCache) {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to load data: ${response.statusText}`);
    }
    dataCache = await response.json();
  }
  return dataCache;
}

// Mapping of tab data-target to their respective HTML file paths
const tabContentFileMap = {
  'my_info_tab_content.html': 'my_info_tab_content.html',
//  'illustrations_tab_content.html': 'illustrations_tab_content.html',
//  'illustrations_tab_content_for_admin.html': 'illustrations_tab_content_for_admin.html'
};

// Reference to the specific tab toggle for "Illustration Gallery"
const illustrationGalleryTabToggle = document.querySelector('.tabs__toggle[data-tab-target="illustrations_tab_content.html"]');

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
    const metadata = await loadMetadata();
    if (metadata && metadata[property] !== undefined) {
      element.textContent = metadata[property];
    } else {
      element.textContent = `No ${property} data available.`;
    }
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
    const metadata = await loadMetadata();
    const value = metadata && metadata[property];
    if (value) {
      if (property === 'email_id') {
        linkElement.href = `mailto:${value}`;
      } else {
        linkElement.href = value;
      }
    } else {
      linkElement.href = '#';
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
    const allData = await loadData();
    const filteredData = allData.filter(item => item.category === category);
    if (filteredData.length > 0) {
      displayFunction(filteredData, containerId);
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

function displayCertificates(certificatesData, containerId) {
  const container = document.getElementById(containerId); // Re-select inside here
  if (!container) return;
  container.innerHTML = '';

  if (certificatesData && certificatesData.length > 0) {

    container.classList.add('columns-1','md:columns-3','gap-4','space-y-4');

    certificatesData.forEach(certificate => {
      const certificatesDiv = document.createElement('div');
      certificatesDiv.classList.add('text-seashell','rounded-md','text-center','items-center','p-[4%]','break-inside-avoid');

              const certTitle = document.createElement('p');
              certTitle.classList.add('montserrat-regular','text-sm','md:text-md','lg:text-lg','mb-[1%]');
              certTitle.textContent = certificate.cert_title;

              const offeredBy = document.createElement('p');
              offeredBy.classList.add('montserrat-light', 'mb-[1%]','text-sm','md:text-md','lg:text-lg','opacity-[70%]');
              offeredBy.textContent = `Offered by: ${certificate.offering_organization}`;

              const certDate = document.createElement('p');
              certDate.classList.add('montserrat-light-i', 'mb-[1%]','text-sm','md:text-md','lg:text-lg','opacity-[70%]');
              certDate.textContent = `Completed: ${certificate.certification_month_year}`;

      certificatesDiv.appendChild(certTitle);
      certificatesDiv.appendChild(offeredBy);
      certificatesDiv.appendChild(certDate);

      container.appendChild(certificatesDiv);
    });
  } else {
    container.textContent = 'No certificates data available.';
  }
}

// ------------ End of helper functions for my data --------------------------

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
    //fetchAndDisplayCards('publication', 'publication-container', displayPublication),
    fetchAndDisplayCards('certificates', 'certificates-container', displayCertificates),
    fetchAndDisplayCards('extracurricular_activities', 'extracurricular-container', displayExtracurricularActivities),
    fetchAndDisplayCards('positions_of_responsibilities', 'por-container', displayPOR)
  ]);
}