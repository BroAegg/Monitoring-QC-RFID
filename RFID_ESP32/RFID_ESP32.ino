#include <LinkedList.h> // Library untuk menyimpan daftar UID

// Inisialisasi port serial untuk kedua RFID reader
HardwareSerial RFID_A(2); // Reader A (Reject) menggunakan Serial2
HardwareSerial RFID_B(1); // Reader B (Finish) menggunakan Serial1

// --- PIN BARU YANG LEBIH STABIL ---
// Pin untuk RFID Reader A (Reject) - Menggunakan pin default Serial2
#define RFID_A_RX_PIN 16 

// Pin untuk RFID Reader B (Finish) - Menggunakan pin custom baru
#define RFID_B_RX_PIN 25

// Pin untuk Buzzer
#define BUZZER_PIN 2

// Variabel untuk counter
int rejectCount = 0;
int finishCount = 0;

// Daftar untuk menyimpan UID yang di-reject
LinkedList<String> rejectedUIDs = LinkedList<String>();

// Variabel untuk cooldown
unsigned long lastScanTimeA = 0;
unsigned long lastScanTimeB = 0;
const long scanCooldown = 3000;

// --- MENGEMBALIKAN FUNGSI NOTIFIKASI DARI KODE LAMA ---
// Fungsi ini akan menyalakan LED Built-in dan Buzzer
void berhasilScan() {
  // Nyalakan LED dan Buzzer
  digitalWrite(LED_BUILTIN, HIGH);
  digitalWrite(BUZZER_PIN, HIGH);
  
  // Beri jeda sebentar untuk bunyi "bip"
  delay(150); 
  
  // Matikan kembali LED dan Buzzer
  digitalWrite(LED_BUILTIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);
}

// Fungsi bantuan untuk mencari UID di dalam daftar
int findUidIndex(String uid) {
  for (int i = 0; i < rejectedUIDs.size(); i++) {
    if (rejectedUIDs.get(i) == uid) {
      return i; // Ditemukan
    }
  }
  return -1; // Tidak ditemukan
}

// Fungsi untuk mencetak status counter ke Serial Monitor
void printStatus() {
  Serial.println("========================");
  Serial.printf("STATUS: REJECT = %d | FINISH = %d\n", rejectCount, finishCount);
  Serial.println("========================");
}


void setup() {
  Serial.begin(115200);
  
  // Inisialisasi port serial untuk RFID reader dengan pin yang sudah diperbaiki
  RFID_A.begin(9600, SERIAL_8N1, RFID_A_RX_PIN, -1); // -1 berarti TX tidak digunakan
  RFID_B.begin(9600, SERIAL_8N1, RFID_B_RX_PIN, -1); // -1 berarti TX tidak digunakan
  
  // Inisialisasi pin LED Built-in dan Buzzer sebagai output
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  Serial.println("Sistem Kontrol RFID Siap.");
  Serial.println("Reader A = REJECT | Reader B = FINISH");
  printStatus();
}

// Fungsi untuk proses Reader A (Reject)
void handleReaderA() {
  if (millis() - lastScanTimeA > scanCooldown && RFID_A.available() > 0) {
    String rawData = RFID_A.readString();
    rawData.trim();
    
    if (rawData.length() >= 12) {
      String cleanID = rawData.substring(1, 13);
      
      if (findUidIndex(cleanID) == -1) {
        rejectedUIDs.add(cleanID);
        rejectCount++;
        
        Serial.print("REJECT -> ID: ");
        Serial.println(cleanID);
        printStatus();
        berhasilScan(); // Panggil notifikasi
        
      } else {
        Serial.println("ID ini sudah ada di daftar REJECT.");
      }
      lastScanTimeA = millis();
    }
  }
}

// Fungsi untuk proses Reader B (Finish)
void handleReaderB() {
  if (millis() - lastScanTimeB > scanCooldown && RFID_B.available() > 0) {
    String rawData = RFID_B.readString();
    rawData.trim();
    
    if (rawData.length() >= 12) {
      String cleanID = rawData.substring(1, 13);
      
      int index = findUidIndex(cleanID);
      if (index != -1) {
        rejectedUIDs.remove(index);
        rejectCount--;
        finishCount++;
        
        Serial.print("FINISH -> ID: ");
        Serial.println(cleanID);
        printStatus();
        berhasilScan(); // Panggil notifikasi

      } else {
        Serial.println("ID ini tidak ada dalam daftar REJECT.");
      }
      lastScanTimeB = millis();
    }
  }
}

void loop() {
  handleReaderA();
  handleReaderB();
}