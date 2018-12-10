/* ************************************************************************

   Copyright:


   License:

   Authors:

 ************************************************************************ */

/**
 * This is the main application class of your custom application "dragndrop"
 * 
 * @asset(qx/icon/Tango/16/status/dialog-error.png)
 */
qx.Class.define("objectid.Application", {
  extend: qx.application.Standalone,

  members: {
    main: function() {
      this.base(arguments);

      if (qx.core.Environment.get("qx.debug")) {
        qx.log.appender.Native;
        qx.log.appender.Console;
      }
      
      var numGlobalEvents = 0;
      qx.event.Manager.setGlobalEventMonitor(function(target, event) {
        numGlobalEvents++;
      });

      var root = this.getRoot();
      
      root.add(new qx.ui.basic.Label("Use the DOM Elements inspector to look at the widgets, " +
      		"check out the 'data-qx-object-id' attributes.<br>\n" +
      		"<br>\n" +
      		"Click the 'Run Test' button and then try this code in console:")
        .set({ rich: true }), { left: 100, top: 20 });
      root.add(new qx.ui.form.TextArea().set({ 
        value: "var edtName = $(\"input[data-qx-object-id='application/exampleEditor/edtName']\");\n" +
        		"console.log(edtName);\n" +
          "console.log(edtName.$$widgetObject);\n" +
          "console.log(edtName.$$widgetObject.classname);\n" +
          "console.log(edtName.$$widgetObject.getValue());\n",
        readOnly: true, width: 600, height: 85 }), 
        { left: 100, top: 80 });
      root.add(this.getObject("btnRunTest"), { left: 100, top: 200 });
      root.add(this.getObject("lblTestResult"), { left: 250, top: 200 });

      var model = qx.data.marshal.Json.createModel([
        { name: "Mr" },
        { name: "Miss" },
        { name: "Mrs" },
        { name: "Rev" }
      ]);
      this.getObject("exampleEditor/ctlrTitle").setModel(model);

      root.add(this.getObject("exampleEditor/container"), { left: 100, top: 250 });
      
      var button_panel = new qx.ui.toolbar.ToolBar();
      
      var btnPushMe = new qx.ui.toolbar.Button("Push Me (Tests #2)").set({ objectId: "pushMe" });
      btnPushMe.addListener("appear", function() {
        button_panel.addOwnedObject(btnPushMe);
        button_panel.setObjectId("buttons");
        qx.core.Id.getInstance().register(button_panel);
      });
      button_panel.add(btnPushMe);
      
      var btnSomeButton = new qx.ui.toolbar.Button("Some Button").set({ objectId: "someButton" });
      btnSomeButton.addListener("appear", function() {
        button_panel.addOwnedObject(btnSomeButton);
      });
      button_panel.add(btnSomeButton);
      
      root.add(button_panel, { left: 100, top: 300 });
      
      var A = qx.core.Assert;
      btnPushMe.addListener("execute", function() {
        btnPushMe.setEnabled(false); // run once, this test is destructive
        
        A.assertTrue(button_panel === qx.core.Id.getObject("buttons"));
        A.assertTrue(btnPushMe === qx.core.Id.getObject("buttons/pushMe"));
        
        var id = btnPushMe.getContentElement().getAttribute("data-qx-object-id");
        A.assertTrue(id === "buttons/pushMe");
        
        button_panel.setObjectId("buttons_renamed");
        A.assertTrue(button_panel === qx.core.Id.getObject("buttons"));
        id = btnPushMe.getContentElement().getAttribute("data-qx-object-id");
        A.assertTrue(id === "buttons/pushMe");
        
        btnPushMe.setObjectId("pushMeToo");
        id = btnPushMe.getContentElement().getAttribute("data-qx-object-id");
        A.assertTrue(id === "buttons/pushMeToo");
        
        button_panel.removeOwnedObject(btnPushMe);
        id = btnPushMe.getContentElement().getAttribute("data-qx-object-id");
        A.assertTrue(!id);
        
        btnPushMe.setObjectId(null);
        id = btnPushMe.getContentElement().getAttribute("data-qx-object-id");
        A.assertTrue(!id);
        
        id = btnSomeButton.getContentElement().getAttribute("data-qx-object-id");
        A.assertTrue(id === "buttons/someButton");
        qx.core.Id.getInstance().unregister(button_panel);
        id = btnSomeButton.getContentElement().getAttribute("data-qx-object-id");
        A.assertTrue(!id);
        
        A.assertTrue(numGlobalEvents > 0);
        
      }, this);
    },
    
    _createObjectImpl: function(id) {
      switch(id) {
      case "exampleEditor":
        return new objectid.ExampleEditor();
        
      case "btnRunTest":
        var btn = new qx.ui.form.Button("Run Test");
        btn.addListener("execute", () => {
          var edt = qx.core.Id.getObject("application/exampleEditor/edtName");
          edt.setValue("John Smith");
          
          var A = qx.core.Assert;
          
          var id = edt.getContentElement().getAttribute("data-qx-object-id");
          A.assertTrue(id === "application/exampleEditor/edtName");
          
          var dom = qx.bom.Selector.query("input[data-qx-object-id='application/exampleEditor/edtName']")[0]
          A.assertTrue(!!dom);
          var widget = qx.ui.core.Widget.getWidgetByElement(dom);
          A.assertTrue(widget === edt);
          this.getObject("lblTestResult").setValue("Tests completed OK");
        });
        return btn;
        
      case "lblTestResult":
        return new qx.ui.basic.Label("Test not run").set({ allowGrowX: true, rich: true });
      }
      
      return this.base(arguments, id);
    }
  }
});
