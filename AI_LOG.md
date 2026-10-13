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