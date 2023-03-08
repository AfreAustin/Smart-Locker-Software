#define BUS_CONTROLLER "0"
#define BUS_ID "1"
#define BUS_ID_2 "-1"
#define RELAY_PIN 10
#define RELAY_PIN_2 5
#define DOORSTATE_PIN 2

// RFID Reader
#define SS_PIN 7
#define RST_PIN 6

#include <ArduinoRS485.h>
#include <SPI.h>//include statements
#include <RFID.h>

RFID rfid(SS_PIN, RST_PIN); // Setup RFID Reader

void setup() {
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(RELAY_PIN_2, OUTPUT);
  pinMode(DOORSTATE_PIN, INPUT);
  digitalWrite(RELAY_PIN, LOW);
  digitalWrite(RELAY_PIN_2, LOW);


  SPI.begin();
  RS485.setPins(-1, 9, 8);
  RS485.begin(9600);

  // enable reception, can be disabled with: RS485.noReceive();
  RS485.receive();
}

void handleCommand(String command) {
  RS485.noReceive();
  Serial.println(command);
  // Get Sender
  int loc = command.indexOf(':');
  String sender = command.substring(0, loc);

  // Get Target
  int loc2 = command.indexOf(':', loc+1);
  String target = command.substring(loc+1, loc2);

  // Get Function
  int loc3 = command.indexOf(':', loc2+1);
  String function = command.substring(loc2+1, loc3);


  if (sender == BUS_CONTROLLER && (target == BUS_ID || target == BUS_ID_2)) {
    String ACKTag = ":ACK:\r\n";
    Serial.println(command);
    // DO STUFF WITH COMMAND
    // BASED OFF function STRING
    if (function == "UL") {
      if (String(BUS_ID) == target) {
        digitalWrite(RELAY_PIN, HIGH);
        delay(1000);
        digitalWrite(RELAY_PIN, LOW);
      } 
      if (String(BUS_ID_2) == target) {
        digitalWrite(RELAY_PIN_2, HIGH);
        delay(1000);
        digitalWrite(RELAY_PIN_2, LOW);
      }
    }

    if (function == "RFID") {
      String RFID_Token = "";
      unsigned long startupTime = millis();
      unsigned long loopTime = startupTime;
      rfid.init();
      while (RFID_Token == "" && ((loopTime - startupTime) <= 10000.0)) {
        if (rfid.isCard()) {
          rfid.readCardSerial();
          RFID_Token = ":RFID" + String(rfid.serNum[0]) + String(rfid.serNum[1]) + String(rfid.serNum[2]) + String(rfid.serNum[3]) + ":";
          ACKTag = RFID_Token + "\r\n";
        }
      loopTime = millis();
      }
      rfid.halt();
      if (RFID_Token == "") {
        ACKTag = ":RFIDNOTSCANNED:\r\n";
      }
    }

    // ACKNOWLEDGE
    RS485.beginTransmission();
    String ackMessage = "";
    if (target == BUS_ID) {
      ackMessage = String(BUS_ID) + ":" + String(BUS_CONTROLLER) + ACKTag;
    } else {
      ackMessage = String(BUS_ID_2) + ":" + String(BUS_CONTROLLER) + ACKTag;
    }
    RS485.print(ackMessage);
    RS485.endTransmission();
  }

  RS485.receive();
};

String command = "";
void loop() {
  digitalWrite(RELAY_PIN, LOW);
  digitalWrite(RELAY_PIN_2, LOW);
  if (RS485.available()) {
    char nextChar = RS485.read();
    command += nextChar;
    if (nextChar == '\n') {
      handleCommand(command);
      command = "";
    }
  }
}

