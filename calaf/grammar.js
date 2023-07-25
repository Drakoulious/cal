const kw = ["REPEAT", "UNTIL", "NEXT", "DO", "FOR", "WHILE",
	"IF", "THEN", "ELSE",
	"VALIDATE", "MODIFY", "MODIFYALL", "INSERT", "DELETE",
	"BEGIN", "END",
	"SETCURRENTKEY", "ASCENDING",
	"FALSE", "TRUE",
	"CASE", "OF",
	"OR", "AND", "NOT",
	"WITH"];
const op = "(),[]+-/*.;=:<>";
const tsep = op + " \n{";
const startBlocks = ["REPEAT", "BEGIN", "CASE"];
const endBlocks = ["UNTIL", "END"];