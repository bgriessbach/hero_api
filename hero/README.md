# Hero Data Test

## Local Setup:
You will need to have the npm package manager installed.  
1. Please clone/download this repository.
2. Please open the command prompt/terminal and navigate to the hero directory.
3. Run "npm install" to download all package dependencies. This Backend requires lodash, Q and request-promise libraries. 
4. Start the server via npm start. Once you see the message: "Server ready. Try to add an event" you can send requests to the server.
5. If you want to use the Swagger API to send requests and view responses, you can open a seperate command prompt/ terminal window and run  "swagger project edit". This will open a Browser Window with the Swagger Endpoint Test API.  

## Usage:
This Server has 3 available Endpoints:  
* /addEvent (POST): Send a list of events to store and argument. (Requires the input parameter "eventList" in body)
* /getEventHistory (GET): Get the current stored event history.
* /getMerchantHistory/{merchantID} (GET): Get a summary of events for specific merchant. (Requires the merchant identifier in path)  



