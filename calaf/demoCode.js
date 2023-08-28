var demoCode = `IF NOT DimMgt.CheckDocDimComb(TempDocDim) THEN
IF LineNo = 0 THEN
ERROR(
Text028,
SalesHeader."Document Type",SalesHeader."No.",DimMgt.GetDimCombErr)
ELSE
ERROR(
Text029,
SalesHeader."Document Type",SalesHeader."No.",LineNo,DimMgt.GetDimCombErr);

IF "Bill-to Customer No." <> "Sell-to Customer No." THEN BEGIN
Cust.GET("Bill-to Customer No.");
IF Receive THEN
Cust.CheckBlockedCustOnDocs(Cust,"Document Type",FALSE,TRUE)
ELSE BEGIN
IF Ship THEN BEGIN
SalesLine.RESET;
SalesLine.SETRANGE("Document Type","Document Type");
SalesLine.SETRANGE("Document No.","No.");
SalesLine.SETFILTER(SalesLine."Qty. to Ship",'<>0');
IF SalesLine.FIND('-') THEN
Cust.CheckBlockedCustOnDocs(Cust,"Document Type",TRUE,TRUE);
END ELSE
Cust.CheckBlockedCustOnDocs(Cust,"Document Type",FALSE,TRUE);
END;
END;
`;