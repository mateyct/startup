# CS 260 Notes

### First notes (From GitHub Reading)
I already knew a lot about GitHub and Git before reading this, but I did learn that you can create a new repository using another one as a template. This could be helpful for me at some point.

[My startup](http://18.233.173.238)

## To-Do
- I may need to add a panel for showing the recent guesses
- I might want to add a place for players to view the info they know
- Include a way for players to show the info they have?

## Helpful links

- [Course instruction](https://github.com/webprogramming260)
- [Canvas](https://byu.instructure.com)
- [MDN](https://developer.mozilla.org)

## AWS Notes
- EC2 is a classification of server that you can run on.
- When setting up a server on AWS, the IP can change every time you restart, but if you use an elastic IP, it will allow you to keep it, but charge while the server is off.
- DNS is the Domain Namer Server, and it maps domain names to IP addresses.
- There are 4 layers of the internet
- Caddy use Let's Encrypt to generate certificates to make the file transfer more secure

## HTML Notes
- It's all about structure, but no styling
- The \<span> tag is inline

| Type           | Meaning                           |
| -------------- | --------------------------------- |
| text           | Single line textual value         |
| password       | Obscured password                 |
| email          | Email address                     |
| tel            | Telephone number                  |
| url            | URL address                       |
| number         | Numerical value                   |
| checkbox       | Inclusive selection               |
| radio          | Exclusive selection               |
| range          | Range limited number              |
| date           | Year, month, day                  |
| datetime-local | Date and time                     |
| month          | Year, month                       |
| week           | Week of year                      |
| color          | Color                             |
| file           | Local file                        |
| submit         | button to trigger form submission |

- It's a smart idea to use a script to deploy to the server

## CSS Notes

| Combinator       | Meaning                    | Example        | Description                                |
| ---------------- | -------------------------- | -------------- | ------------------------------------------ |
| Descendant       | A list of descendants      | `body section` | Any section that is a descendant of a body |
| Child            | A list of direct children  | `section > p`  | Any p that is a direct child of a section  |
| General sibling  | A list of siblings         | `div ~ p`      | Any p that has a div sibling               |
| Adjacent sibling | A list of adjacent sibling | `div + p`      | Any p that has an adjacent div sibling     |

There are more combinators than I realized.

Attribute selector:
```css
p[class='summary'] {
  color: red;
}
```


## Node Notes
Steps: 
1. Create your project directory
2. Initialize it for use with NPM by running npm init -y
3. Make sure .gitignore file contains node_modules
4. Install any desired packages with npm install <package name here>
5. Add require('<package name here>') to your application's JavaScript
6. Use the code the package provides in your JavaScript
7. Run your code with node index.js

With VS Code you can create a launch configuration that specifies the watch parameter when every you debug with VS Code. In VS Code press CTRL-SHIFT-P (on Windows) or ⌘-SHIFT-P (on Mac) and type the command Debug: Add configuration. Select the Node.js option. This will create a launch configuration named .vscode/launch.json. Modify the configuration so that it includes the --watch parameter. This should look something like the following.

## React notes
[React Info](https://react.dev/learn)

Curly braces {} allow you to escape back into JavaScript from JSX, allowing you to treat whatever is inside exactly like JS.

JSX can be rendered conditionally like so:

```jsx
<div>
  {isLoggedIn ? (
    <AdminPanel />
  ) : (
    <LoginForm />
  )}
</div>

// or even like:

<div>
  {isLoggedIn && <AdminPanel />}
</div>
```

### Routing
[Routing Tutorial](https://blog.webdevsimplified.com/2022-07/react-router/)

Defining routes is as simple as defining a single Route component for each route in your application and then putting all those Route components in a single Routes component. Whenever your URL changes React Router will look at the routes defined in your Routes component and it will render the content in the element prop of the Route that has a path that matches the URL. In the above example if our URL was /books then the BookList component would be rendered.

I can put my header and footer in the main .jsx page, then put `<Routes>` between them. This will keep the same header and footer throughout. I'll need to make some changes to make the user display correctly in the header, though.

`<Route path="*" element={<NotFound />} />` will match any route, good for 404s.

## Backend Stuff
HTTP methods:
- POST: create a resource
- GET: get a resource
- PUT: update a reserouce
- DELETE: delete a resource

## Express
See the `first-express` to see examples of how to use Express

It took forever to learn this, but because the front end code and the backend are running on different ports, I had to set up Vite to proxy requests to the correct port, then set up the API router in my service.