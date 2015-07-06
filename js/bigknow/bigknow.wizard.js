/**
 * It's a general purpose of wizard widgets
 * 
 * Depends:
 * <jsp:include page="wizardDependency.jsp" flush="true" />
 * 
 * Usage as below:
 */
//	// Prepare the wizard step panels
//	var panels = [];
//	panels.push(new NodeSelect());
//	panels.push(new NodeDbConfig());
//	panels.push(new NodeTableSelect());
//	panels.push(new NodeTableKeys());
//	panels.push(new NodeTableMapping());
//	
//	// Initialize wizard
//	$.wizard.init('wizardDialog'/*dialogId*/, 'wizard'/*wizardId*/, {
//		title: "创建节点、节点数据库连接、云模型"
//	}, panels);
//	
//	// Show wizard
//	$.wizard.open();

$.wizard = $.wizard||{};

/**
 * Initialize wizard
 */
$.wizard.init = function(dialogId, wizardId, dialogOptions, panels) {
	// Default wizard width and height
	this.windowHeight = $(document).height()*0.9;
	this.windowWidth = $(document).width()*0.9;
	
	console.info("windowHeight=", this.windowHeight, "windowWidth=", this.windowWidth);
	
	// Init dialog
	this.dialogId = '#'+dialogId;
	var options = {	// Default options
			autoOpen: false,
			modal: true,
			minWidth: 800,
			width: this.windowWidth>980?this.windowWidth:980,
			minHeight: 630,
			//height: this.windowHeight,
			resize: $.hitch(this, this.onresize),
			open: $.hitch(this, this.onopen),
			close: $.hitch(this, this.onclose),
			beforeClose: $.hitch(this, this.beforeClose)
		};
	options = dialogOptions?$.extend(options, dialogOptions):options;
	this.dialog = $(this.dialogId);
	this.dialog.dialog(options);
	
	// Init wizard
	this.wizardId = '#' + wizardId;
	this.wizard = $(this.wizardId);
	this.wizard.steps({
		stepsOrientation: 1, /*vertical*/
		transitionEffect: 'slideLeft',
		onStepChanging: $.hitch(this, this.onStepChanging),
		onStepChanged: $.hitch(this, this.onStepChanged),
		onFinishing: $.hitch(this, this.onFinishing),
		onFinished: $.hitch(this, this.onFinished)
	});

	// Panel's JavaScript object
	/*
	 * Most important functions for each steps are
	 * - init()
	 * - validate()
	 * - getValues()
	 * Most important fields are
	 * - name
	 */
	this.panels = panels||[];
	
	this.resetInitFlags();
	
	/*
	 * Fill wizard reference, to make sure panel can get back to wizard and other panel
	 */
	this.fillWizardReference();

	/*
	 * Setup the value map
	 */
	this.panelValueMap = {};
};

/**
 * Setup dialog option
 * @param optionName
 * @param optionValue
 */
$.wizard.dialogOption = function(optionName, optionValue) {
	this.dialog.dialog("option", optionName, optionValue);
};

/**
 * Open wizard
 */
$.wizard.open = function() {
	console.info("wizard.open()");
	
	var wizard = this.wizard;
	
	// Initialize first step
	var panels = this.panels;
	var firstPanel = panels[0];
	if(firstPanel && firstPanel.init) {
		firstPanel.init();
		firstPanel.initFlag = true;

		console.info(firstPanel.name, " initialized");
	}
	
	// Open
	$(this.dialogId).dialog("open");

	if(firstPanel && firstPanel.onShow) {
		firstPanel.onShow();
	}
	
//	$('div[aria-describedby="wizardDialog"]').css('height', '550px');
	
	this.wizard.css('height', 	this.wizard.parent().height() + "px");
};

/**
 * Wizard dialog resize function
 */
$.wizard.onresize = function(event, ui) {
	console.info("Dialog resize.");
};

/**
 * Wizard dialog close event
 * @param evt
 */
$.wizard.onclose = function(evt) {
	console.info("Dialog closed.");
};

/**
 * Wizard dialog close event
 * @param evt
 */
$.wizard.beforeClose = function(evt) {
	console.info("Dialog before close.");

	if(this.beforeCloseCallback && !this.finished) {
		return this.beforeCloseCallback();
	}

	return true;
};

/**
 * Wizard dialog resize function
 */
$.wizard.onopen = function(event, ui) {
	console.info("Dialog open.");
	
	/*
	 * Reset to initial step
	 */
	this.resetToFirstStep();

	// Reset initialize flag for each steps
	this.resetInitFlags();
};

/**
 * Give reference for the wizard and this to all panels
 */
$.wizard.fillWizardReference = function() {
	var panels = this.panels;
	this.panelMap = {};
	
	for(var i in panels) {
		var panel = panels[i];
		
		if(panel) {
			// find the panel object
		} else {
			panel = {};
			panel.name = "panel_"+i;
			panels[i]=panel;
		}
		
		/*
		 * Set reference
		 */
		panel.container = this;
		panel.wizard = this.wizard;
		
		/*
		 * Setup panel map, further can refer to panel by name
		 */
		if(panel.name) {
			// Nothing
		} else {
			panel.name = "panel_"+i;
		}
		
		this.panelMap[panel.name] = panel;
	}
};

/**
 * Reset all initialize flag for each step
 */
$.wizard.resetInitFlags = function() {
	var panels = this.panels;
	
	for(var i in panels) {
		var panel = panels[i];
		
		if(panel) {
			// find the panel object
		} else {
			panel = {};
			panels[i]=panel;
		}
		
		panel.initFlag = false;
	}

	this.finished = false;
};

/**
 * Set values for specific panel
 * @param panelName
 */
$.wizard.setPanelValues = function(panelName, values) {
	this.panelValueMap[panelName] = values;
};

/**
 * Get values for specific panel
 * @param panelName
 */
$.wizard.getPanelValues = function(panelName) {
	var panel = this.panelMap[panelName];
	if(panel) {
		return panel.getValues();
	} else {
		return this.panelValueMap[panelName]||{};
	}
};

/**
 * On wizard finishing
 */
$.wizard.onStepChanging = function(event, currentIndex, newIndex) {
	console.info("wizard.onStepChanging()", event, currentIndex, newIndex);
	
	/*
	 * Always allow, if go to previous
	 */
	if(newIndex < currentIndex) {
		return true;
	}
	
	/*
	 * Make sure to issue the validation, if that step provide one
	 */
	var panel = this.panels[currentIndex];
	if(panel && panel.validate) {
		console.info(panel.name, " validating");
		return panel.validate();
	}
	
	return true;
};

/**
 * On wizard finishing
 */
$.wizard.onStepChanged = function(event, currentIndex, newIndex) {
	console.info("wizard.onStepChanged()", event, currentIndex, newIndex);
	
	/*
	 * Make sure to issue the initialization, if that step provide one
	 */
	var panel = this.panels[currentIndex];
	if(panel && panel.init && !panel.initFlag && currentIndex>newIndex) {
		panel.init();
		panel.initFlag = true;
		
		console.info(panel.name, " initialized");
	}
	
	/*
	 * Call on show for the panel.
	 * - Forward, backward, forward case coverage
	 */
	if(panel && panel.onShow && currentIndex>newIndex) {
		panel.onShow();
	}

	/*
	 * Adjust the size of the step.
	 */
	var contentDiv = this.wizard.find('div.content');
	var bodyDiv = this.wizard.find('div.current')
		.css({
			width: (contentDiv.width()-40)+"px",
			height: (contentDiv.height()-40) + "px"
		});


	
	return true;
};

/**
 * On wizard finishing
 */
$.wizard.onFinishing = function(event, currentIndex) {
	console.info("wizard.onFinishing()", event, currentIndex);
	
	/*
	 * Make sure to issue the validation, if that step provide one
	 */
	var panel = this.panels[currentIndex];
	if(panel && panel.validate) {
		console.info(panel.name, " validating");
		return panel.validate();
	}
	
	return true;
};

/**
 * On wizard finished
 */
$.wizard.onFinished = function(event, currentIndex) {
	console.info("wizard.onFinished()", event, currentIndex);

	/*
	 * Already finish all tasks
	 */
	this.finished = true;

	$(this.dialogId).dialog("close");
	
	/*
	 * Reset to first step.
	 * - Stop user wait
	 */
	this.resetToFirstStep();

	/*
	 * If there are any of the extra function is called.
	 */
	if( this.finishedCallBack ) {
		this.finishedCallBack();
	}

	return true;
};

/**
 * Reset to first step
 */
$.wizard.resetToFirstStep = function() {
	// Go to first step
	var wizard = this.wizard;
	while(wizard.steps("previous")) {
	}
	
	// Reset the menu style for the wizard
	wizard.find("li[role='tab']").removeClass("done").removeClass("error").addClass("disabled");
};

/**
 * Show error for the dialog only
 * @param text
 */
$.wizard.showError = function(text) {
	this.dialog.noty({text: text, type: "error", timeout: 3*1000, layout: "topCenter"});
};

/**
 * Set the finished callback function
 * @param finishedCallBack
 */
$.wizard.setFinishedCallBack = function(finishedCallBack) {
	// Store finished call back.
	this.finishedCallBack = finishedCallBack;
};

/**
 * Set the beforeClose callback function
 * @param beforeCloseCallback
 */
$.wizard.setBeforeCloseCallBack = function(beforeCloseCallback) {
	// Store finished call back.
	this.beforeCloseCallback = beforeCloseCallback;
};