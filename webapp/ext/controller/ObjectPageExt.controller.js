sap.ui.controller("crs.cras_gr_po_int06.ext.controller.ObjectPageExt", {
	onInit: function () {

		// The create handling unit button on the po item table should only be active in case of selected items
		this.oPoItemTable = this._getPoItemTable();

		if (this.oPoItemTable) {
			this.oPoItemTable.attachEvent("selectionChange", jQuery.proxy(this.onSelectionChangeHandleCreateHu, this));
		}
	},

	onAfterRendering: function () {
		// The Add HU button should only be visible in edit mode
		var oCreateHuButton = this._getHuCreateButton();
		if (oCreateHuButton) {
			oCreateHuButton.bindProperty("visible", "ui>/editable");
		}
		// Set create HU button state
		this.setCreateHuButtonEnabled(this._getPoItemTable());

		var oHuTable = this._getHuTable();
		if (oHuTable) {
			oHuTable.setMode("MultiSelect");
			oHuTable.setGrowing(false);
		}
	},
	onClickActionHuCreate: function (oEvent) {
		// Call action to create new handling unit
		var oPoItemTable = this._getPoItemTable();

		if (!oPoItemTable.getSelectedContexts()[0]) {
			return;
		}
		var oBindContextSelectedRow = oPoItemTable.getSelectedContexts()[0];

		var oApi = this.extensionAPI;
		var oParams = {
			"deliveryId": oBindContextSelectedRow.getProperty("deliveryId"),
			"poId": oBindContextSelectedRow.getProperty("poId"),
			"poItemId": oBindContextSelectedRow.getProperty("poItemId"),
			"DraftUUID": oBindContextSelectedRow.getProperty("DraftUUID"),
			"IsActiveEntity": oBindContextSelectedRow.getProperty("IsActiveEntity")
		};

		var oPromise = oApi.invokeActions("/ZC_PO_GR_DELIVERY_PO_ITEMCreate_hu", oBindContextSelectedRow,
			oParams);
		oPromise.then(function (aResponse) {
			if (aResponse[0] && aResponse[0].response) {
				var oResponseContext = aResponse[0].response.context;
				if (oResponseContext) {
					var oNavController = oApi.getNavigationController();
					var oNavInfo = {
						navigationProperty: "to_handling_units"
					};
					// New Hu refresh the liist
					oApi.refresh(
						"crs.cras_gr_po_int06::sap.suite.ui.generic.template.ObjectPage.view.Details::ZC_PO_GR_DELIVERY--idRefFctDlvHuList::responsiveTable"
					);
					oNavController.navigateInternal(oResponseContext, oNavInfo);
				}
			}
		});
	},
	onSelectionChangeHandleCreateHu: function (oEvent) {
		this.setCreateHuButtonEnabled(this._getPoItemTable());

	},
	setCreateHuButtonEnabled: function (oPoItemTable) {
		if (oPoItemTable) {
			var oSelectedDistrRow = oPoItemTable.getSelectedContexts()[0];
		}
		var oCreateHuButton = this._getHuCreateButton();
		if (oCreateHuButton) {
			if (oSelectedDistrRow) {
				oCreateHuButton.setEnabled(true);
			} else {
				oCreateHuButton.setEnabled(false);

			}
		}
	},

	_getHuTable: function () {
		return this.getView().byId(
			"crs.cras_gr_po_int06::sap.suite.ui.generic.template.ObjectPage.view.Details::ZC_PO_GR_DELIVERY--idRefFctDlvHuList::responsiveTable"
		);
	},
	_getPoItemTable: function () {
		return this.getView().byId(
			"crs.cras_gr_po_int06::sap.suite.ui.generic.template.ObjectPage.view.Details::ZC_PO_GR_DELIVERY--idRefFctDlvPoItems::responsiveTable"
		);
	},
	_getHuCreateButton: function () {
		return this.getView().byId(
			"crs.cras_gr_po_int06::sap.suite.ui.generic.template.ObjectPage.view.Details::ZC_PO_GR_DELIVERY--ActionHuCreatebutton");
	}
});