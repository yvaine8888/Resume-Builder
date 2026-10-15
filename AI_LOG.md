## First Prompt
# What I asked for:
Create a basic ui that accepts inputs for the information. I attached a pdf of a basic resume template. It should have values like name, education, actviites, awards, etc. The ui should use pastels blues and white. They should allow blanks to questions except for the rudimentary info like name, address and contact.
# What it produced:
Resume-builder UI in App.jsx, with pastel-blue styling in App.css and index.css. It includes required name, email, phone, and address fields; optional education, experience, activities, awards, skills, and summary; and the ability to add or remove entries. There’s also a live resume preview on wider screens. It has a nav bar on the side for the different sections. It uses usestate to store the inputs.
# Fixed or Rejected:
It seemed pretty good to me.
# Verification:
Was able to run it and see the ui. It looks good, but I want to sperate the sections.


## Second Prompt
# What I asked for:
Give a plan that keeps the nav page but links the different sections to the corresponding. I want to seperate the sections into different pages. To navigate, you can use the nav bar or the next button. Give pages that switvh with no full reload.
# What it produced:
Add React Router with a URL for each of the six resume sections, enabling client-side transitions and browser Back/Forward. Adding Previous/Next controls and keeping shared form state across routes. Persist entered data in local storage, enforce required contact fields when proceeding from Personal Details, and keep sidebar navigation freely accessible.
# Fixed or Rejected:
I was skeptical about the local storage so I asked and they could just convert the resume object to text and use json to parse it. It seemed fine.
# Verification:
Was able to run it and see the new ui. I wasn't able to go to the next page because of required info. I was able to navigate with the next and previous button and the nav page.

## Third Prompt
# What I asked for:
To meet requirements: enter a list from from data.json file with .map and to never mutate state directly but make a new array
# What it produced:
Move static section metadata (labels, URLs, headings, descriptions, icons) from App.jsx into a project-local data.json. Import the JSON and use .map() for the sidebar and route elements, preserving the existing React Router URLs and UI. Keep user-entered resume data in React state/local storage, and ensure edits/additions/removals use immutable object and array updates.
Run lint and build checks after the refactor.
# Fixed or Rejected:
It seemed good to me. At first it wanted to add the user inputs into the json file to render with .map() but I rejected it.
# Verification:
Was able to run it and use new ui so it works. Data.json appeared and it rendered the info.


## Fourth Prompt
# What I asked for:
Cart style state where someone can create multiple resumes. There is a home page where they can view all resumes created, and and add button that takes them to the resume builder. No creating resumes for now, just home page that keeps and renders resume objects.
# What it produced:
Add / as a client-side Home page showing the saved resume list, an empty state, and an Add button. Convert the current single saved resume into an identified resume object in a local-storage list, preserving its existing data.
Keep the existing builder UI; selecting a saved card opens the builder with that resume, and the builder gains a Home link. Add opens a blank, temporary builder draft that stays isolated: it won’t overwrite a listed resume or appear in the saved list.
# Fixed or Rejected:
It seemed good to me. I had to specify whether the add button keeps the draft.
# Verification:
Was able to run it and use new ui so it works. 


## Fifth Prompt
# What I asked for:
When the user clicks the done for now button, it should create a resume object, and render in the home page, adding to teh list of resumes.
# What it produced:
Make “Done for now” on a new draft require name, email, phone, and address, even if the user navigated directly to the last section.
Create a uniquely identified resume object, immutably add it to the saved list, persist it, and return to Home only after the save succeeds.
Keep the draft visible and report an error if browser storage fails.
For an existing saved resume, return Home without making a duplicate. Then run lint and a production build.
# Fixed or Rejected:
It seemed good to me.
# Verification:
Was able to run it and click done for now for a new resume.



## Sixth Prompt
# What I asked for:
I want to change the resume cards. Add an edit, remove, and download icon to each card. Do not implement the download for now, but the edit should take it to the resume builder for that card, and the remove should remove the resume from the page and list.
# What it produced:
Refactor each saved resume card to include separate, accessible Edit, Remove, and Download icon controls. Edit opens that resume in the existing builder through React Router. Remove asks for confirmation, then deletes the entry from local storage and the Home list; if persistence fails, keep the card and show an error. Show Download as an active-looking, accessible icon that intentionally does nothing for now; no PDF export is added.
# Fixed or Rejected:
It seemed good to me just had to specify some things about the download icon.
# Verification:
The edit icon took me to the resume builder. The download icon didn't work, and the remove asked me to confirm before removing.



## Seventh Prompt
# What I asked for:
To mee the criteria, I asked it to add an express server that uses the endpoint for a health check.
# What it produced:
Add Express as a separate API server with a real GET /api/health JSON endpoint.
Keep the existing React/Vite app intact and proxy /api through Vite during development.
Verify lint/build and make an HTTP request to confirm the endpoint responds with JSON. Resume-related API behavior is out of scope.
# Fixed or Rejected:
It seemed good to me. I may need to separate the frontend from backend soon.
# Verification:
I checked on the health endpoint and it returned healthy (npm run build).
