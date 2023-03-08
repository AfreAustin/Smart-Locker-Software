// C Standard Includes
#include <stdio.h>
#include <string.h>
#include <errno.h>
#include <termios.h>
#include <unistd.h>

// C++ Standard Includes
#include <iostream>
#include <sstream>
#include <queue>
#include <chrono>

// Wire Pi Includes
#include <wiringPi.h>
#include <wiringSerial.h>

// HTML API Calls
#include "includes/httplib.h"

#define BUS_ID "0"
#define DE_PIN 0
#define RE_PIN 1


using namespace std;
using namespace httplib;
using namespace std::chrono;

int serialDescriptor;
queue<string> recievedData;

PI_THREAD(RecieveData) {
    string line; // Latest Data from Arduinos
    while TRUE {
        while (serialDataAvail(serialDescriptor)) {
            char nextChar = serialGetchar(serialDescriptor);
            line.append(1, nextChar);
            if (nextChar == '\n') {
                piLock(1);
                line = line.c_str();
                
                // Tokenize Message
                std::stringstream potentialAck_ss(line);
                std::string token;
                std::vector<std::string> messageTokens;
                while(getline(potentialAck_ss, token, ':')) {
                    messageTokens.push_back(token);
                }

                if (messageTokens[0] != BUS_ID) {
                    recievedData.push(line);
                }
                line = "";
                piUnlock(1);
            }
        }
    }
}

int main ()
{
    wiringPiSetup();
    pinMode(OUTPUT, DE_PIN);
    pinMode(OUTPUT, RE_PIN);
    digitalWrite(DE_PIN, HIGH); // Transmit
    digitalWrite(RE_PIN, LOW); // Recieve

    serialDescriptor = serialOpen("/dev/serial0", 9600); // Connected to Hardware Serial Port (Pins)

    // If there was an error opening, exit out
    if (serialDescriptor < 0)
    {
        fprintf (stderr, "Unable to open serial device: %s\n", strerror (errno)) ;
        return 1;
    }

    // Setup Serial Connection Appropriately (No Parity and 8 Bits)
    struct termios options;
    tcgetattr(serialDescriptor, &options);
    options.c_cflag &= (~CSIZE | PARENB);
    options.c_cflag |= CS8;
    tcsetattr(serialDescriptor, TCSAFLUSH, &options);

    int recvStart = piThreadCreate(RecieveData);

    // HTTP
    httplib::Server apServ;

    apServ.Post("/getRFID", [](const Request& req, Response& res) {
        while (recievedData.size() != 0) {
                recievedData.pop();
        }
        serialPrintf(serialDescriptor, (BUS_ID + req.body + "\r\n").c_str());
        auto start = high_resolution_clock::now();
        auto end = start;
        while (duration_cast<seconds>(end-start).count() < 11.0) {
            piLock(1);
            if (recievedData.size() >= 1) {
                res.set_content(recievedData.front().c_str(), "text/plain");
                recievedData.pop();
                piUnlock(1);
                return;
            }
            piUnlock(1);
            end = high_resolution_clock::now();
        }
        res.set_content("NO:ACK:", "text/plain");
    });

    apServ.Post("/unlock", [](const Request& req, Response& res) {
	while (recievedData.size() != 0) {
		recievedData.pop();
	}
        serialPrintf(serialDescriptor, (BUS_ID + req.body + "\r\n").c_str());
        auto start = high_resolution_clock::now();
        auto end = start;
        while (duration_cast<seconds>(end-start).count() < 2.0) {
            piLock(1);
            if (recievedData.size() >= 1) {
                res.set_content(recievedData.front().c_str(), "text/plain");
                recievedData.pop();
                piUnlock(1);
                return;
            }
            piUnlock(1);
            end = high_resolution_clock::now();
        }
        res.set_content("NO:ACK:", "text/plain");
    });

    apServ.listen("0.0.0.0", 5201);

    serialClose(serialDescriptor);
}
