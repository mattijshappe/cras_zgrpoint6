sap.ui.controller("crs.cras_gr_po_int06.ext.controller.ListReportExt", {

	onClickActionCreateHUGR: function (oEvent) {
		var that = this;
		sap.ui.getCore().getMessageManager().removeAllMessages();
		var oResourceBundle = that.getOwnerComponent().getModel("i18n").getResourceBundle();
		// Get / check for selected items
		var oListTable = that.getView().byId(
			"crs.cras_gr_po_int06::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_PO_GR_PO_ITEMS--listReport").getTable();
		var aSelectedItemContexts = oListTable.getSelectedContexts();

		if (aSelectedItemContexts.length === 0) {
			sap.m.MessageBox.warning(oResourceBundle.getText("noItemsSelected"));
			return;
		}

		//Check no items selected for wich a draft exits
		// Build JSON string with all selected po items
		var aSelectedItems = [];
		for (var i = 0; i < aSelectedItemContexts.length; i++) {
			var oSelectionObject = aSelectedItemContexts[i].getModel().getObject(aSelectedItemContexts[i].sPath);
			if (oSelectionObject.draftDeliveryId !== "00000000-0000-0000-0000-000000000000") {
				// A draft already exists for po item, creation not possible
				sap.m.MessageBox.error(oResourceBundle.getText("draftExistForPoItem", [oSelectionObject.purchaseOrderId, oSelectionObject.purchaseOrderItemId]));
				return;
			}
			var oSelectedPoItem = {
				"purchaseOrder": oSelectionObject.purchaseOrderId,
				"purchaseOrderItem": oSelectionObject.purchaseOrderItemId
			};
			aSelectedItems.push(oSelectedPoItem);
		}
		var sSelectedItem = JSON.stringify(aSelectedItems);
		var oApi = this.extensionAPI;
		var oParams = {
			"SelectedItems": sSelectedItem
		};

		var oPromise = oApi.invokeActions("/ZC_PO_GR_DELIVERYCreate", [],
			oParams);
		oPromise.then(function (aResponse) {
			if (aResponse[0] && aResponse[0].response) {
				var oResponseContext = aResponse[0].response.context;
				if (oResponseContext) {
					var oNavController = oApi.getNavigationController();
					var oNavInfo = {
						navigationProperty: ""
					};
					oNavController.navigateInternal(oResponseContext, oNavInfo);
				}
			}
		}).catch(function (aErr) {

			if (!aErr[0]) {
				return;
			}
			var oError = aErr[0];
			that.getView().setBusy(false);
			if (oError.error.response.statusCode < 500) {
				if (!that._oMessageDialog) {
					that._oMessageDialog = that._createMessageDialog();
				}
				that._oMessageDialog.open();
			}
		});
	},

	onListNavigationExtension: function (oEvent) {
		// return false to trigger the default internal navigation
		// return true is necessary to prevent further default navigation		
		var oBindingContext = oEvent.getSource().getBindingContext();
		var oObject = oBindingContext.getObject();

		if (oObject.draftDeliveryId !== "00000000-0000-0000-0000-000000000000") {
			//takeover draft, if draft belongs to another owner, navigation is not possible
			// Current user should be the daft owner
			this._takeOverDraft(oObject.draftDeliveryId);
			return true;
		} else {
			// No draft available for now no further navigation allowed
			return true;
		}
	},

	_takeOverDraft: function (gDraftGuid) {
		// Call function to takeover the draft
		//takeover draft, if draft belongs to another owner, navigation is not possible
		// Current user should be the daft owner
		// After takeover navigation to draft instance is triggered
		var that = this;
		var oApi = this.extensionAPI;
		var oParams = {
			"DraftGuid": gDraftGuid
		};

		var oPromise = oApi.invokeActions("/ZC_PO_GR_DELIVERYTakeover_draft", [],
			oParams);
		oPromise.then(function (aResponse) {
			if (aResponse[0] && aResponse[0].response) {
				var oResponseContext = aResponse[0].response.context;
				if (oResponseContext) {
					var oNavController = oApi.getNavigationController();
					var oNavInfo = {
						navigationProperty: ""
					};
					oNavController.navigateInternal(oResponseContext, oNavInfo);
				}
			}
		}).catch(function (aErr) {

			if (!aErr[0]) {
				return;
			}
			var oError = aErr[0];
			that.getView().setBusy(false);
			if (oError.error.response.statusCode < 500) {
				if (!that._oMessageDialog) {
					that._oMessageDialog = that._createMessageDialog();
				}
				that._oMessageDialog.open();
			}
		});
	},

	_createMessageDialog: function () {
		var oMessageTemplate = new sap.m.MessageItem({
			type: "{type}",
			title: "{message}"
		});

		var oMessageView = new sap.m.MessageView({
			items: {
				path: "/",
				template: oMessageTemplate
			}
		});

		oMessageView.setModel(sap.ui.getCore().getMessageManager().getMessageModel());
		var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

		var oDialog = new sap.m.Dialog({
			title: oResourceBundle.getText("Messages"),
			resizable: true,
			content: oMessageView,
			state: "Error",
			beginButton: new sap.m.Button({
				press: function () {
					oDialog.close();
				},
				text: oResourceBundle.getText("Close")
			}),
			contentHeight: "300px",
			contentWidth: "500px",
			verticalScrolling: false
		});
		return oDialog;
	}

});