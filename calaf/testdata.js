var testData = [];

//#0
testData.push(`
if 2 = 1 
  or 4=3
then  begin
  if 2 = 3 then
    message('3')
  else 
    message('5')
end 
else
  message('7'); message('x//;l');
if 3=3 then x=3
else z=3;
if 3=3 then 
  x=3
else begin
  z=3;
end;
if gg=23 then
begin
  sll=33;
end
;
if gg=23 then
begin
  sll=33;
end
else 
begin
  ssl=44;
end
;

if gg=23 then begin
  sll=33;
end else begin
  ssl=44;
end;

if gg=25 then begin
  sll=331;
end else 
  ssl=445;


if 4=4 then x=4 else x=5;
if 2=2 then
  z=2;
if 5=76 then begin
  p=4;
end;
if 4=4 then x=4 else 
  x=5;
if 4=4 
then x=4 else 
  x=5;
if 4=4 
then 
  x=4 else x=5;
i := 2;
message('ok');

if z=3 then
  z:=3
else begin
  if x=4 then
    message('ok');
end;`);

//#1
testData.push(`
IF Amount <> 0 THEN
  IF Amount > 0 THEN
    Sales := Sales + Amount
  ELSE
    IF Reason = Reason::Return THEN
      IF ReasonForReturn = ReasonForReturn::Defective THEN
        Refund := Refund + Amount
      ELSE
        Credits := Credits + Amount
    ELSE
      Sales := Sales - Amount;`);

//#2
testData.push(`
if a=0 Then
Begin
  If b=0 Then
    If c=0 Then
      Writeln('-1')
    Else                              
      Writeln('0')
  Else
  Begin
    x := c/b;
  end;
end;`);

//#3
testData.push(`
if a=0 Then
  x := c/b;`);

//#4
testData.push(`
if a=0 Then
  x := c/b
else
  z := 3;`);

//#5
testData.push(`
if a=0 Then begin
  x := c/b
end
else
  z := 3;`);

//#6
testData.push(`
if a=0 Then begin
  x := c/b
end
else begin
  z := 3;
end`, `
IF ReservEntry.FINDSET THEN
  REPEAT
    IF ReservEntry."Appl.- from Item Entry" = 0 THEN
      ItemTracking:= FALSE;
  UNTIL ReservEntry.NEXT = 0
ELSE
  ItemTracking:= FALSE;`);

//#7
testData.push(`
case 3 of
  1: message('1');
  2: begin
    message('2')
  end
  else
    message('x')
end;`);

//#8
testData.push(`
case 3 of
  1: 
    message('1');
  2: begin
    message('2')
  end
  else
    message('x')
end;`);

//#9
testData.push(`
case 3 of
  1: 
    message('1');
  2: begin
    message('2')
  end
  else begin
    message('x')
  end
end;`);

//#10
testData.push(`
case 3 of
  1: 
    message('1');
  2: begin
    message('2')
  end
  else begin
    message('x')
  end;
end;`);

//#11
testData.push(`
case 3 of
  1: 
    message('1');
  2: begin
    message('2')
  end
  else 
  begin
    message('x')
  end;
end;`);

//#12
testData.push(`
CASE SourceType OF
  SourceType::Sales: SetSalesHeaderLocal(GLobalSalesHeader);
  SourceType::Shipment: SetWhseShipmentHeaderLocal(GlobalWhseShipmentHeader);
  SourceType::Promise: SetOrderPromisingLineLocal(GlobalOrderPromisingLine);
  SourceType::Shipment2: SetWhseShipmentHeader2Local(GlobalWhseShipmentHeader);
  SourceType::PostShipment: SetPostWhseShipmentHeaderLocal(GlobalPostedWhseShipmentHeader);
  ELSE ERROR('%1', SourceType);
END;`);

//#13
testData.push(`
for i:=1 to 10 do
  message('ok');`);

//#14
testData.push(`
for i:=1 to 10 do begin
  message('ok');
end;`, `
for i:=1 to 10 do 
begin
  message('ok');
end;`);

//#15
testData.push(`
NeedInsert := FALSE;
IF (BlanketOrderSalesLine."Qty. to Ship" <> 0)
THEN BEGIN
  NeedInsert := TRUE;
  TempInsertedLine := BlanketOrderSalesLine;
  TempInsertedLine.INSERT;
END
ELSE IF TempInsertedLine.GET(BlanketOrderSalesLine."Document Type",
  BlanketOrderSalesLine."Document No.",
  BlanketOrderSalesLine."Attached to Line No.")
THEN 
  NeedInsert := TRUE;
`);

//#16
testData.push(`
IF 1=1 THEN BEGIN
  IF 2=2 THEN BEGIN
    IF 3=3 THEN 
      ERROR('1');
  END
  ELSE 
    ERROR('2');
END;
`)