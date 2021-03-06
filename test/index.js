// test/index.js

const path = require("path");

function get_user(service,req,res) {
  service.render(req,res,"User","user",{});
}

function get_drive(service,req,res) {
  service.render(req,res,"Drive","drive",{});
}

function get_drive_browser(service,req,res) {
  service.render(req,res,"Drive Browser","drive-browser",{});
}

function get_drive_picker(service,req,res) {
  service.render(req,res,"DrivePicker","drive-picker",{});
}

function post_drive_browser_submit_test(service,req,res) {
  console.log(req.body);
  service.render(
    req,
    res,
    "DriveBrowser Submit Test",
    "drive-browser-submit",
    {
      params: req.body
    }
  );
}

function post_drive_picker_submit_test(service,req,res) {
  console.log(req.body);
  service.render(
    req,
    res,
    "DrivePicker Submit Test",
    "drive-picker-submit",
    {
      params: req.body
    }
  );
}

function get_list(service,req,res) {
  service.render(req,res,"List","list",{});
}

function get_list_browser(service,req,res) {
  service.render(req,res,"List Browser","list-browser",{});
}

module.exports = {
  title: "Graph Layer Components",

  static: [
    ["/graph-layer-components/assets",path.join(__dirname,"./public")]
  ],

  templatePath: path.join(__dirname,"./templates"),

  routes: [
    ["/graph-layer-components/userinfo",get_user,"User"],
    ["/graph-layer-components/drive",get_drive,"Drive"],
    ["/graph-layer-components/drive-browser",get_drive_browser,"DriveBrowser"],
    ["/graph-layer-components/drive-picker",get_drive_picker,"DrivePicker"],
    ["/graph-layer-components/list",get_list,"List"],
    ["/graph-layer-components/list-browser",get_list_browser,"ListBrowser"]
  ],

  postRoutes: [
    ["/graph-layer-components/drive-browser/submit-test",post_drive_browser_submit_test],
    ["/graph-layer-components/drive-picker/submit-test",post_drive_picker_submit_test]
  ],

  assets: {
    scripts: [
      "/graph-layer-components/assets/test.js"
    ],
    styles: [
      "/graph-layer-components/assets/test.css"
    ]
  }
};
