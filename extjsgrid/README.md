**Run the application on your local machine**
 
Prerequisite
* Install Sencha CMD: https://www.sencha.com/products/extjs/cmd-download/
* Download Ext JS 6.5 and unzip it into any folder (that's the folder you specify in step 3)
* Make sure that the Ext JS version in ```extjsgrid/workspace.json``` matches the downloaded Ext JS version

1. Clone the repository
2. ```cd extjsgrid/client```
3. ```sencha app install --framework=/path/to/extjs/```
4. ```sencha app watch```
5. In another shell ```cd extjsgrid```
6. ```./mvnw spring-boot:run -Dspring.profiles.active="development"```
7. Open url http://localhost:8080 in a browser

