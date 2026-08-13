# SRS Notes Placeholder

Refer to the approved IEEE Std 830-1998 project SRS document maintained by the research team.
No requirements are duplicated here to avoid divergence from the source SRS.

Software Requirements Specification (SRS)
IoT Based Sleep Monitoring for Eco-Friendly Pain Relief Pillow
Version 1.0
Project Team
● Ayush Sadavarte
● Sammrudhi Kulkarni
● Sahil Badve
Submitted To
Department of Computer Engineering
Marathwada Mitramandal’s College of Engineering
Project Guide
Prof. Suvarna Ma’am
Academic Year
2026–2027
Date: 30th July 2026
Revision History
Version Date Author(s) Description of Changes
0.1 23 July 2026 Project Team Initial concept and project proposal
0.5 24 July 2026 Project Team Hardware architecture finalized
0.8 25 July 2026 Project Team Functional requirements drafted
1.0 30 July 2026 Project Team Initial SRS released for review
Table of Contents
1. Introduction
1.1 Purpose
1.2 Introduction
1.3 Scope
1.4 Objectives
1.5 Definitions, Acronyms and Abbreviations
1.6 References
1.7 Document Organization
2. Overall Description
2.1 Product Perspective
2.2 Product Functions
2.3 User Classes and Characteristics
2.4 Operating Environment
2.5 Design Constraints
2.6 Assumptions and Dependencies
3. System Architecture
3.1 Overall Architecture
3.2 Hardware Architecture
3.3 Software Architecture
3.4 Data Flow
3.5 Sensor Interfaces
4. External Interface Requirements
4.1 Hardware Interfaces
4.2 Software Interfaces
4.3 Communication Interfaces
4.4 Database Interfaces
4.5 User Interface
5. Functional Requirements
5.1 Heart Rate Monitoring
5.2 Breathing Pattern Monitoring
5.3 Velostat Pressure Monitoring
5.4 Head Movement Detection
5.5 Temperature Monitoring
5.6 Data Acquisition
5.7 Cloud Storage
5.8 Dashboard and Visualization
5.9 Comparative Sleep Analysis
6. Non-Functional Requirements
6.1 Performance Requirements
6.2 Reliability
6.3 Security
6.4 Privacy
6.5 Maintainability
6.6 Scalability
7. Verification and Validation
7.1 Functional Testing
7.2 Hardware Validation
7.3 System Validation
7.4 Acceptance Criteria
Appendices
Appendix A – Sensor Specifications
Appendix B – Communication Protocol
Appendix C – System Block Diagram
Appendix D – Test Cases
1. Introduction
1.1 Purpose
This Software Requirements Specification (SRS) defines the functional and non-functional requirements
for the Low-Cost IoT Sleep Monitoring Pillow Prototype. The document serves as the primary
reference for system design, hardware integration, software development, testing, and validation of the
proposed smart pillow monitoring system.
The objective of the prototype is to evaluate the effectiveness of an organically developed pillow by
collecting sleep-related parameters using affordable Internet of Things (IoT) technologies. The acquired
data are intended to support comparative analysis of sleep comfort before and after using the proposed
pillow.
The system is designed exclusively for academic research and product evaluation purposes. It is not
intended to diagnose sleep disorders or replace clinical sleep-monitoring equipment.
1.2 Introduction
Sleep quality plays an important role in physical health, mental well-being, and daily performance.
Improper pillow support can contribute to neck pain, discomfort, restlessness, and poor sleep quality,
while conventional sleep-monitoring methods are often costly and unsuitable for continuous use in natural
home environments. Recent studies on smart pillows have shown that low-cost IoT-based systems can
provide a practical and non-intrusive approach for monitoring sleep-related behavior such as head
movement, posture, and environmental conditions.
The proposed project aims to develop and evaluate an organic material pillow prepared using natural
ingredients such as rice grass, Jatamansi for relaxation, and processed cow-dung-derived organic material.
In addition to improving comfort and relaxation, the pillow also supports sustainability by promoting the
use of biodegradable, eco-friendly, and naturally sourced materials as an alternative to conventional
synthetic pillow fillings. Organic and eco-friendly pillows are increasingly recognized for their potential
to reduce chemical exposure and support environmentally responsible product design.
To assess the effectiveness of the proposed pillow, this project integrates a low-cost IoT-based sleep
monitoring system capable of collecting before-and-after sleep data. The monitoring setup acquires data
related to heart rate, breathing patterns, pillow pressure distribution, head movement, and pillow surface
temperature. These measurements enable comparative evaluation of sleep quality, comfort, neck pain, and
restlessness while maintaining a completely non-clinical and non-invasive monitoring approach.
By combining sustainable material innovation with smart sensing technologies, the proposed system
contributes to both environmentally responsible product development and affordable IoT-based sleep
research.
1.3 Scope
The proposed system is a non-clinical IoT-based sleep monitoring prototype intended for comparative
analysis of sleep behavior in natural home environments or controlled academic research settings. The
system continuously acquires physiological and environmental data during sleep using low-cost sensors
integrated with an ESP32-based data acquisition unit.
The prototype utilizes four sensing mechanisms:
● A wearable non-invasive heart rate sensor for monitoring cardiovascular activity.
● A microphone-based breathing sensor that measures breathing intensity through sound level
analysis without recording or storing voice data.
● A Velostat-based pressure sensing matrix positioned beneath the pillow to monitor pressure
distribution, head position, and movement frequency.
● A temperature sensor to observe pillow surface temperature and evaluate the thermal behavior of
the proposed organic pillow.
The collected data are transmitted to a cloud database for storage, visualization, and comparative analysis.
The system enables researchers to compare sleep-related parameters before and after using the proposed
organic pillow, thereby assisting in evaluating improvements in comfort, reduction in movement, thermal
characteristics, and perceived sleep quality.
The prototype is intended solely for research, educational, and product evaluation purposes. It does not
perform medical diagnosis, sleep-stage classification, or treatment recommendation.
1.4 Objectives
The primary objectives of the proposed system are:
1. To design and develop a low-cost IoT-based sleep monitoring pillow prototype using an ESP32
microcontroller and affordable sensing technologies.
2. To monitor heart rate during sleep using a wearable, non-invasive wrist-based heart rate sensor.
3. To capture breathing patterns using a microphone by analyzing breathing sound intensity without
recording or storing voice data, thereby ensuring user privacy.
4. To develop a Velostat-based pressure sensing matrix capable of detecting head position, pressure
distribution, and movement frequency throughout the sleep session.
5. To monitor pillow surface temperature and evaluate the thermal characteristics of the proposed
organic pillow in comparison with conventional pillows.
6. To collect and compare sleep-related data before and after using the proposed organic pillow,
including movement frequency, pressure variation, breathing patterns, heart rate trends,
temperature variation, and sleep duration.
7. To assess improvements in sleep comfort, reduction in neck pain, and decrease in sleep
disturbances through sensor observations combined with user feedback.
8. To evaluate whether the proposed organic pillow provides measurable improvements in sleep
quality, comfort, and thermal performance when compared with a conventional pillow.
1.5 Definitions, Acronyms and Abbreviations
Term Definition
IoT Internet of Things
ESP32 Low-power Wi-Fi and Bluetooth-enabled microcontroller used for data acquisition
HR Heart Rate
BPM Beats Per Minute
dB Decibel
Velostat Pressure-sensitive conductive material used for force sensing
Wi-Fi Wireless communication protocol used for cloud connectivity
BLE Bluetooth Low Energy
CSV Comma Separated Values
JSON JavaScript Object Notation
RTC Real-Time Clock
UI User Interface
1.6 References
1. IEEE Std 29148-2018 – Systems and Software Engineering – Life Cycle Processes –
Requirements Engineering.
2. IEEE Std 830-1998 – Recommended Practice for Software Requirements Specifications.
3. Espressif Systems. ESP32 Series Technical Reference Manual.
4. Relevant research articles on smart pillow systems, IoT-based sleep monitoring, Velostat pressure
sensing, and sustainable ergonomic pillow design.
1.7 Document Organization
This document is organized into seven major sections. Following the introduction, the overall system
description explains the product perspective, operating environment, user classes, and design constraints.
Subsequent sections describe the system architecture, hardware and software interfaces, functional
requirements, non-functional requirements, and verification methodology. The appendices provide
supplementary information, including sensor specifications, communication protocols, block diagrams,
and testing procedures.
2. Overall Description
2.1 Product Perspective
The Low-Cost IoT Sleep Monitoring Pillow Prototype is a non-clinical smart monitoring system
designed to evaluate the effectiveness of an organic ergonomic pillow through continuous observation of
sleep-related parameters. The prototype combines low-cost sensing technologies, wireless
communication, cloud-based storage, and data visualization to provide researchers with quantitative
information regarding sleep comfort and pillow performance.
Unlike conventional polysomnography (PSG) systems, which require multiple clinical sensors and
specialized laboratory environments, the proposed system adopts a simple, affordable, and non-invasive
approach suitable for home environments and academic research. The system does not attempt to
diagnose sleep disorders or classify sleep stages. Instead, it records physiological and physical parameters
that are associated with sleep comfort, head movement, breathing behavior, and thermal characteristics.
The prototype consists of four sensing modules integrated with an ESP32-based data acquisition unit:
● A wearable heart rate sensor to monitor cardiovascular activity during sleep.
● A microphone-based breathing sensor that detects breathing intensity through sound level
analysis while ensuring that no voice recordings are stored.
● A Velostat-based pressure sensing matrix placed beneath the pillow to measure pressure
distribution, head position, and movement frequency.
● A temperature sensor to monitor pillow surface temperature and evaluate the thermal behavior of
the organic pillow.
The ESP32 acquires data from the sensors, performs preliminary processing, timestamps the
measurements, and transmits them to a cloud database through Wi-Fi. A dashboard application retrieves
the stored data to generate visualizations and comparative reports for before-and-after pillow evaluation.
2.2 Product Functions
The primary functions of the proposed system are summarized below.
Heart Rate Monitoring
The system continuously receives heart rate measurements from a wearable wrist-based heart rate sensor.
The acquired data are stored with timestamps for later visualization and comparison between different
sleep sessions.
Breathing Pattern Monitoring
A microphone positioned near the pillow captures breathing sound intensity by measuring decibel levels.
The microphone does not record speech or voice data. Instead, only processed sound intensity values are
stored, enabling breathing pattern visualization while maintaining user privacy.
Pressure Distribution Monitoring
A Velostat-based pressure sensing matrix installed beneath the pillow detects the pressure exerted by the
user's head. The pressure values are used to determine head position, pressure distribution, and variations
occurring throughout the sleep session.
Head Movement Detection
Changes in pressure distribution over time are analyzed to identify head movements and movement
frequency. These observations provide an indication of sleep restlessness and user comfort.
Temperature Monitoring
A temperature sensor continuously monitors the pillow surface temperature. The recorded thermal profile
is used to evaluate the heat retention and cooling characteristics of the proposed organic pillow compared
with conventional pillows.
Data Acquisition and Storage
The ESP32 periodically collects sensor readings, timestamps the measurements, and transmits them to a
cloud database using Wi-Fi. The stored information can later be exported for detailed analysis.
Data Visualization
A web-based or mobile dashboard displays graphs of heart rate, breathing intensity, pressure distribution,
movement events, and temperature variation throughout the sleep session.
Comparative Sleep Analysis
The collected data are compared between baseline sleep sessions using a conventional pillow and
subsequent sessions using the proposed organic pillow. This comparison assists researchers in evaluating
improvements in comfort, reduction in movement, and thermal performance.
2.3 User Classes and Characteristics
The proposed system is intended for the following categories of users.
2.3.1 Test Subject
The test subject is the individual sleeping on the pillow during data collection. The user interacts
minimally with the system by wearing the heart rate sensor and sleeping naturally. No manual operation is
required during the monitoring period.
2.3.2 Researcher
Researchers configure the system, initiate data collection, monitor sensor status, retrieve recorded
datasets, and perform comparative analysis. They also interpret graphical reports generated by the
dashboard.
2.3.3 Project Developers
The development team is responsible for integrating hardware, maintaining firmware, improving
algorithms, calibrating sensors, and troubleshooting communication or software-related issues.
2.3.4 Faculty Supervisor
The faculty supervisor evaluates project progress, reviews experimental data, verifies system
performance, and validates the effectiveness of the proposed organic pillow.
2.4 Operating Environment
The proposed system operates within the following environment.
Component Description
Microcontroller ESP32 Development Board
Heart Rate Sensor Wearable wrist-based sensor (Bluetooth-enabled or equivalent)
Breathing Sensor Electret or MEMS microphone with sound intensity processing
Pressure Sensor Velostat-based pressure sensing matrix
Temperature Sensor Contact temperature sensor (e.g., DS18B20, LM35, or equivalent)
Communication Wi-Fi (IEEE 802.11 b/g/n)
Cloud Platform Firebase, ThingSpeak, AWS IoT, or equivalent
Database Cloud-hosted real-time database
Dashboard Web or mobile application
Development Environment Arduino IDE or ESP-IDF
Programming Language C/C++, JavaScript/Python (for dashboard and analytics)
2.5 Design and Implementation Constraints
The development of the proposed prototype is subject to the following constraints.
C-1 Low-Cost Design
The system shall utilize affordable and commercially available hardware components to ensure that the
overall prototype remains economically feasible for academic research.
C-2 Non-Invasive Operation
The monitoring process shall not interfere with the user's normal sleeping behavior. All sensors shall
operate without causing discomfort or restricting movement.
C-3 Privacy Protection
The breathing sensor shall analyze only sound intensity levels. The system shall not record, store, or
transmit speech or voice recordings.
C-4 Wireless Communication
Sensor data shall be transmitted wirelessly through the ESP32 using Wi-Fi. Temporary communication
failures shall not result in permanent loss of recorded data whenever local buffering is available.
C-5 Research Prototype
The system is intended solely for research and comparative evaluation purposes and shall not provide
medical diagnosis or treatment recommendations.
C-6 Eco-Friendly Integration
The embedded sensing system shall be designed so that it does not significantly alter the ergonomic
properties or sustainability objectives of the proposed organic pillow.
2.6 Assumptions and Dependencies
The following assumptions apply during system operation.
● The wearable heart rate sensor remains properly worn throughout the sleep session.
● The microphone is positioned to primarily capture breathing sounds while minimizing ambient
environmental noise.
● The Velostat pressure sensing matrix remains correctly aligned beneath the pillow during
experimentation.
● The temperature sensor maintains consistent contact with the pillow surface for accurate
measurements.
● Wi-Fi connectivity is available for uploading recorded sensor data to the cloud database.
● The ESP32 remains continuously powered throughout the monitoring period.
● Users perform experiments under similar environmental conditions during before-and-after
comparisons to ensure consistency.
3. System Architecture
3.1 Overall System Architecture
The proposed prototype follows a layered IoT architecture consisting of four primary layers:
1. Sensing Layer
2. Edge Processing Layer
3. Cloud Layer
4. Application Layer
Sensor data are acquired in real time, processed by the ESP32, transmitted to the cloud, and finally
visualized through a dashboard for comparative analysis.
3.2 Hardware Architecture
The hardware architecture consists of four sensing modules connected to an ESP32 microcontroller.
Microphone
(Breathing Sensor)
Wearable Heart Rate Sensor
(Wrist)
72
BPM
ESP32 Development Board
ADC/ GPIO Interfaces
Wi-Fi Communication Module
Cloud Database
Dashboard Application
Velostat Pressure Matrix
(Installed Below Pillow)
Temperature Sensor
(Pillow Surface)
3.3 Software Architecture
The software is divided into multiple functional modules.
3.4 Data Flow
The operational sequence of the proposed system is as follows:
1. The heart rate sensor, microphone, Velostat pressure matrix, and temperature sensor collect
sleep-related data.
2. The ESP32 receives sensor readings at predefined sampling intervals.
3. The acquired measurements are filtered and timestamped.
4. The processed data are transmitted to the cloud database via Wi-Fi.
5. The dashboard retrieves stored data and generates graphs and comparative reports.
6. Researchers analyze the differences between baseline and organic pillow sleep sessions to
evaluate improvements in comfort and sleep behavior.
3.5 Sensor Interfaces
Sensor Parameter
Measured
Interface Purpose
Wearable Heart
Rate Sensor
Heart Rate (BPM) Bluetooth Low
Energy (BLE) or
Serial
Monitor cardiovascular activity
during sleep
Microphone Breathing sound
intensity (dB)
Analog/ADC Analyze breathing patterns
without storing voice data
Velostat Pressure
Matrix
Pressure distribution
and head movement
Analog Multiplexed
Inputs
Detect head position, pressure
variation, and movement
frequency
Temperature
Sensor
Pillow surface
temperature (°C)
Digital
(One-Wire/I²C) or
Analog
Evaluate thermal behavior and
cooling characteristics of the
pillow
4. External Interface Requirements
4.1 Hardware Interfaces
The proposed Low-Cost IoT Sleep Monitoring Pillow Prototype interfaces with four sensing devices and
an ESP32-based data acquisition unit. Each sensor measures a specific physiological or environmental
parameter related to sleep comfort and pillow performance. The ESP32 serves as the central controller
responsible for sensor communication, data processing, and wireless transmission.
HIR-1 Wearable Heart Rate Sensor Interface
The system shall interface with a wearable, non-invasive wrist-based heart rate sensor capable of
continuously measuring heart rate during sleep. The heart rate sensor shall communicate with the ESP32
using Bluetooth Low Energy (BLE) or an equivalent wireless communication protocol.
Input Parameter: Heart Rate (BPM)
Communication Interface: Bluetooth Low Energy (BLE)
Purpose: Continuous monitoring of heart rate trends during sleep.
HIR-2 Breathing Sensor Interface
The breathing sensor consists of a sensitive microphone positioned near the pillow. The microphone
measures breathing sound intensity by detecting variations in sound pressure level. The system processes
only the decibel values and breathing waveform characteristics without recording or storing voice data.
Input Parameter: Breathing Sound Intensity (dB)
Communication Interface: Analog Input (ADC)
Purpose: Monitoring breathing patterns while maintaining user privacy.
HIR-3 Velostat Pressure Sensor Interface
The pressure sensing module consists of a Velostat-based pressure matrix embedded beneath the pillow.
Variations in resistance caused by applied pressure are measured through the ESP32 Analog-to-Digital
Converter (ADC). The acquired pressure map is used to estimate head position and detect movement
frequency.
Input Parameters:
● Pressure Distribution
● Head Position
● Pressure Variation
● Movement Frequency
Communication Interface: Analog Multiplexed Inputs (ADC)
HIR-4 Temperature Sensor Interface
A temperature sensor is placed near the pillow surface to continuously monitor surface temperature
throughout the sleep session. The recorded temperature profile is used to evaluate heat retention and
cooling characteristics of the proposed organic pillow.
Input Parameter: Pillow Surface Temperature (°C)
Communication Interface: One-Wire / I²C / Analog (depending on selected sensor)
4.2 Software Interfaces
The software architecture consists of firmware executing on the ESP32, cloud services for data storage,
and a dashboard application for visualization and analysis.
SIR-1 Firmware
The firmware shall perform:
● Sensor initialization
● Periodic sensor data acquisition
● Signal preprocessing
● Timestamp generation
● Data packet formation
● Wireless communication
SIR-2 Cloud Database
The cloud database shall store all sensor observations received from the ESP32.
Each uploaded record shall include:
● Timestamp
● Heart Rate
● Breathing Intensity
● Pressure Sensor Values
● Temperature
● Device Identifier
SIR-3 Dashboard
The dashboard shall retrieve stored data and display:
● Heart Rate Graph
● Breathing Pattern Graph
● Pressure Distribution Graph
● Head Movement Timeline
● Temperature Variation Graph
● Comparative Before-and-After Reports
4.3 Communication Interfaces
Communication between system components shall follow the architecture shown in Section 3.
CIR-1 Sensor Communication
Sensor Communication
Heart Rate Sensor Bluetooth Low Energy (BLE)
Microphone Analog ADC
Velostat Matrix Analog ADC
Temperature Sensor One-Wire / I²C / Analog
CIR-2 ESP32 to Cloud Communication
The ESP32 shall transmit sensor readings to the cloud database through Wi-Fi using HTTP or MQTT
communication protocols.
Each transmitted packet shall contain:
● Device ID
● Timestamp
● Heart Rate
● Breathing Intensity
● Pressure Values
● Temperature
CIR-3 Data Synchronization
Each sensor reading shall be timestamped before transmission to maintain synchronization among
multiple sensor streams.
4.4 Database Interfaces
The cloud database shall organize sensor observations according to sleep sessions.
Each session shall include:
Field Description
Session ID Unique Sleep Session Identifier
User ID Participant Identifier
Timestamp Date and Time
Heart Rate BPM
Breathing Intensity dB
Pressure Data Velostat Matrix Values
Temperature Pillow Temperature
Remarks Optional Notes
The database shall support:
● Real-time data insertion
● Historical data retrieval
● CSV export
● Comparative session analysis
4.5 User Interface
The dashboard shall provide an intuitive graphical interface for researchers.
The interface shall display:
Home Screen
● Device Connection Status
● Current Sensor Status
● Active Sleep Session
Live Monitoring Screen
● Heart Rate
● Breathing Intensity
● Pressure Heat Map
● Temperature
● Wi-Fi Status
Historical Analysis
Users shall be able to:
● Select previous sleep sessions
● Compare baseline and experimental sessions
● View graphical trends
● Export reports
Dashboard Outputs
The dashboard shall generate:
● Line graphs
● Pressure heat maps
● Temperature curves
● Heart rate trends
● Movement frequency charts
● Comparative analysis reports
5. Functional Requirements
The functional requirements define the expected behavior of each subsystem in the proposed sleep
monitoring prototype. Each requirement is assigned a unique identifier to facilitate verification and
validation.
5.1 Heart Rate Monitoring
FR-HR-001 Sensor Initialization
The system shall establish communication with the wearable heart rate sensor before the start of each
monitoring session.
FR-HR-002 Continuous Monitoring
The system shall continuously receive heart rate measurements from the wearable sensor throughout the
sleep session.
FR-HR-003 Data Logging
Each heart rate reading shall be stored with an accurate timestamp in the cloud database.
FR-HR-004 Trend Visualization
The dashboard shall display heart rate variations over the entire monitoring session using graphical plots.
5.2 Breathing Pattern Monitoring
FR-BR-001 Microphone Initialization
The system shall initialize the breathing sensor before data acquisition begins.
FR-BR-002 Breathing Detection
The microphone shall measure breathing sound intensity using sound pressure levels without storing
voice recordings.
FR-BR-003 Privacy Protection
The system shall process only breathing intensity values and shall not record speech or identifiable audio.
FR-BR-004 Pattern Visualization
The dashboard shall display breathing intensity as a time-varying graph.
5.3 Velostat Pressure Monitoring
FR-PS-001 Pressure Acquisition
The system shall continuously measure pressure values from the Velostat sensing matrix.
FR-PS-002 Pressure Distribution
The software shall generate a pressure distribution map representing the user's head position.
FR-PS-003 Head Movement Detection
Changes in pressure distribution over time shall be analyzed to detect head movement events.
FR-PS-004 Movement Frequency
The system shall calculate the total number of head movement events occurring during a sleep session.
FR-PS-005 Pressure Logging
All pressure measurements shall be stored in the cloud database together with timestamps.
5.4 Temperature Monitoring
FR-TMP-001 Continuous Monitoring
The system shall continuously monitor the pillow surface temperature.
FR-TMP-002 Temperature Logging
Temperature readings shall be recorded together with timestamps.
FR-TMP-003 Temperature Trend
The dashboard shall display temperature variation throughout the sleep session.
5.5 Data Acquisition
FR-DA-001 Sensor Synchronization
The ESP32 shall periodically acquire data from all connected sensors.
FR-DA-002 Timestamp Generation
Each acquired sensor reading shall be assigned a timestamp before storage.
FR-DA-003 Data Validation
Invalid or missing sensor readings shall be identified and logged without interrupting system operation.
FR-DA-004 Data Packaging
Sensor readings shall be combined into a single structured data packet before transmission.
Excellent. Below are the final sections of the SRS, rewritten to match your updated project based on the
Wearable Heart Rate Sensor, Microphone, Velostat Pressure Matrix, Temperature Sensor, and
ESP32.
6. Non-Functional Requirements
Non-functional requirements define the quality attributes and operational characteristics of the proposed
Low-Cost IoT Sleep Monitoring Pillow Prototype. These requirements ensure that the system performs
reliably, securely, efficiently, and remains easy to maintain and expand.
6.1 Performance Requirements
NFR-PER-001 Data Acquisition Performance
The system shall acquire data from all connected sensors at predefined sampling intervals without
significant delays.
Acceptance Criteria:
● Continuous sensor data acquisition throughout the monitoring session.
● No interruption during normal operation.
NFR-PER-002 Communication Performance
The ESP32 shall transmit sensor data to the cloud database with minimal latency whenever Wi-Fi
connectivity is available.
Acceptance Criteria:
● Data transmission delay shall normally remain below 5 seconds.
NFR-PER-003 Dashboard Performance
The dashboard shall retrieve and display stored sensor data within an acceptable response time.
Acceptance Criteria:
● Historical graphs shall load within 3 seconds under normal network conditions.
NFR-PER-004 Storage Performance
The database shall support continuous storage of sleep session data without loss of records.
6.2 Reliability Requirements
NFR-REL-001 Continuous Operation
The system shall operate continuously throughout an entire sleep session (typically 6–10 hours) without
requiring manual intervention.
NFR-REL-002 Data Integrity
Each sensor reading shall be timestamped before storage to maintain chronological consistency.
NFR-REL-003 Sensor Failure Handling
If one sensor temporarily fails, the remaining sensors shall continue acquiring and transmitting data.
The system shall generate an appropriate sensor status message.
NFR-REL-004 Communication Recovery
Following temporary Wi-Fi interruption, the ESP32 shall automatically reconnect and resume data
transmission without restarting the system.
6.3 Security Requirements
NFR-SEC-001 Secure Communication
Communication between the ESP32 and the cloud server should use secure communication protocols
such as HTTPS or MQTT over TLS whenever supported.
NFR-SEC-002 User Authentication
Only authorized researchers shall be allowed to access stored experimental data through the dashboard.
NFR-SEC-003 Data Protection
The system shall prevent unauthorized modification of stored experimental records.
6.4 Privacy Requirements
NFR-PRI-001 Audio Privacy
The breathing sensor shall process only breathing sound intensity.
The system shall not record, store, or transmit speech or voice recordings.
NFR-PRI-002 Participant Privacy
Experimental data shall be associated with anonymized participant identifiers instead of personally
identifiable information.
NFR-PRI-003 Research Usage
Collected data shall be used solely for research, academic analysis, and evaluation of the proposed
organic pillow.
6.5 Usability Requirements
NFR-USA-001 Simple Operation
The prototype shall require minimal user interaction during operation.
NFR-USA-002 Dashboard Visualization
Researchers shall be able to visualize recorded sensor data through graphs and comparative reports
without requiring specialized software knowledge.
NFR-USA-003 Non-Intrusive Monitoring
The monitoring process shall not significantly interfere with the user's normal sleeping posture or
comfort.
6.6 Maintainability Requirements
NFR-MNT-001 Modular Design
Sensor drivers, communication modules, and dashboard components shall be implemented as independent
software modules.
NFR-MNT-002 Sensor Replacement
The software architecture shall allow replacement of individual sensors without requiring complete
redesign of the application.
NFR-MNT-003 Software Updates
Firmware updates shall be performed independently without modifying the cloud database structure.
6.7 Scalability Requirements
NFR-SCL-001 Sensor Expansion
The system architecture shall permit integration of additional sensors in future versions.
Examples include:
● Humidity Sensor
● Ambient Light Sensor
● Air Quality Sensor
● Additional Pressure Zones
NFR-SCL-002 Multi-User Capability
The database design shall support storage of sleep sessions from multiple participants.
6.8 Portability Requirements
The software shall remain compatible with commonly available ESP32 development boards and standard
Wi-Fi networks.
The dashboard shall be accessible from desktop and mobile web browsers.
7. Verification and Validation
Verification and Validation (V&V) activities ensure that the implemented system satisfies the functional
and non-functional requirements defined in this SRS.
7.1 Verification Strategy
Verification shall include:
● Hardware inspection
● Firmware testing
● Communication testing
● Dashboard validation
● Experimental evaluation
Each subsystem shall be tested independently before complete system integration.
7.2 Functional Testing
VT-01 Heart Rate Sensor Test
Objective
Verify that the wearable heart rate sensor correctly transmits heart rate values to the ESP32.
Procedure
● Connect the wearable sensor.
● Record heart rate for five minutes.
● Compare displayed values with the wearable device.
Expected Result
Heart rate values are continuously received and displayed without interruption.
VT-02 Breathing Sensor Test
Objective
Verify breathing intensity measurement.
Procedure
● Simulate normal breathing near the microphone.
● Observe changes in measured decibel values.
Expected Result
Breathing waveform responds to inhalation and exhalation.
No speech recordings are stored.
VT-03 Pressure Sensor Test
Objective
Verify Velostat pressure sensing.
Procedure
● Apply pressure at multiple pillow locations.
● Observe pressure distribution.
Expected Result
Pressure values change according to applied force.
Pressure map correctly reflects head position.
VT-04 Head Movement Detection
Objective
Verify movement detection.
Procedure
● Move the head repeatedly across the pillow.
● Compare movement events with observed movements.
Expected Result
Each major movement is detected and logged.
VT-05 Temperature Sensor Test
Objective
Verify temperature measurement.
Procedure
● Warm the pillow surface using normal body contact.
● Observe temperature variation.
Expected Result
Temperature readings increase and gradually decrease after pressure is removed.
VT-06 Cloud Communication Test
Objective
Verify wireless communication.
Procedure
● Connect ESP32 to Wi-Fi.
● Upload sensor data.
Expected Result
Cloud database receives complete sensor records.
VT-07 Dashboard Test
Objective
Verify visualization.
Procedure
● Retrieve stored data.
● Generate graphs.
Expected Result
Dashboard displays all sensor readings correctly.
7.3 System Integration Testing
The complete prototype shall be tested during an overnight sleep session.
The following observations shall be verified:
● Continuous heart rate acquisition
● Continuous breathing monitoring
● Pressure distribution recording
● Head movement detection
● Temperature monitoring
● Wireless communication
● Cloud storage
● Dashboard visualization
The experiment shall be repeated for:
● Conventional pillow
● Proposed organic pillow
The collected datasets shall then be compared.
7.4 Comparative Evaluation
The effectiveness of the proposed organic pillow shall be evaluated by comparing measurements obtained
before and after its use.
The following parameters shall be analyzed:
Parameter Evaluation Method
Heart Rate Trend Graphical comparison
Breathing Pattern Waveform comparison
Pressure Distribution Pressure map analysis
Head Movement Frequency Number of movement events
Temperature Variation Temperature profile
User Feedback Questionnaire responses
7.5 Acceptance Criteria
The proposed prototype shall be considered successful if:
● All sensors operate continuously throughout a sleep session.
● Sensor readings are correctly stored in the cloud database.
● The dashboard displays graphical representations of all recorded parameters.
● Head movement events are successfully detected using the Velostat pressure matrix.
● Breathing intensity is monitored without storing voice recordings.
● Temperature variations are successfully recorded.
● Heart rate measurements are continuously received from the wearable sensor.
● Comparative reports between conventional and organic pillows can be generated.
● Researchers can evaluate differences in movement, pressure distribution, thermal behavior, and
user comfort using the recorded data.
7.6 Validation Summary
Requirement Category Verification Method Acceptance Standard
Heart Rate Monitoring Functional Test Continuous BPM data displayed and stored
Breathing Monitoring Experimental Test Breathing waveform detected; no voice
recorded
Pressure Monitoring Load Test Pressure changes accurately reflected in
sensor output
Head Movement
Detection
Experimental
Observation
Movement events detected and logged
Temperature Monitoring Thermal Test Temperature variations recorded correctly
Wi-Fi Communication Communication Test Sensor data uploaded successfully to cloud
Dashboard User Interface Test Graphs generated without errors
Database Storage Test Data stored and retrieved successfully
Comparative Analysis Experimental Validation Before-and-after reports generated correctly
APPENDIX A – Acronyms and Abbreviations
Abbreviation Full Form
ADC Analog-to-Digital Converter
BLE Bluetooth Low Energy
BPM Beats Per Minute
CSV Comma-Separated Values
ESP32 Espressif 32-bit Wi-Fi and Bluetooth
Microcontroller
GUI Graphical User Interface
HTTP Hypertext Transfer Protocol
IoT Internet of Things
MQTT Message Queuing Telemetry Transport
PCB Printed Circuit Board
REST Representational State Transfer
RTC Real-Time Clock
SRS Software Requirements Specification
TLS Transport Layer Security
UI User Interface
Wi-Fi Wireless Fidelity
APPENDIX B – Glossary
Organic Pillow
A pillow developed using environmentally friendly natural materials such as rice grass, Jatamansi, and
processed cow-dung-derived organic material for improved comfort and sustainability.
Sleep Session
A continuous period during which sensor data are collected while a participant sleeps.
Pressure Distribution
The variation of pressure exerted by the user’s head on different regions of the Velostat pressure sensing
matrix.
Head Movement Event
A significant change in the pressure distribution pattern indicating movement of the user’s head during
sleep.
Breathing Intensity
The sound pressure level (in decibels) generated by breathing, measured by the microphone without
storing audio recordings.
Thermal Behaviour
The heating and cooling characteristics of the pillow surface during and after contact with the user’s head.
Comparative Analysis
The process of comparing sensor observations obtained before and after using the proposed organic
pillow to evaluate changes in sleep-related parameters.
APPENDIX C – Hardware Specifications
1. ESP32 Development Board
Parameter Specification
Controller ESP32
CPU Dual-Core Xtensa LX6
Clock Speed Up to 240 MHz
RAM 520 KB SRAM
Flash Memory 4 MB (typical)
Connectivity Wi-Fi, Bluetooth, BLE
Operating Voltage 3.3 V
2. Wearable Heart Rate Sensor
Parameter Specification
Type Wrist-Worn Heart Rate Sensor
Measurement Heart Rate (BPM)
Interface Bluetooth Low Energy (BLE)
Usage Continuous heart rate monitoring
3. Microphone Module
Parameter Specification
Type Electret / MEMS Microphone Module
Measurement Sound Intensity
Output Analog Signal
Purpose Breathing pattern monitoring
Privacy No voice recording or storage
4. Velostat Pressure Matrix
Parameter Specification
Material Velostat Conductive Film
Measurement Pressure Distribution
Output Variable Resistance
Interface Analog ADC
Purpose Head position and movement detection
5. Temperature Sensor
Parameter Specification
Type Surface Temperature Sensor
Measurement Pillow Surface Temperature
Output Digital/Analog (sensor-dependent)
Purpose Thermal behaviour monitoring
APPENDIX D – Software Specifications
Component Technology
Firmware Arduino IDE (ESP32 Framework)
Programming Language C++
Database Firebase Realtime Database / Firestore
(depending on implementation)
Dashboard HTML, CSS, JavaScript
Charts Chart.js or equivalent
Communication HTTP or MQTT
Operating System Windows 10/11
APPENDIX E – System Assumptions
The proposed prototype is developed under the following assumptions:
● The participant wears the heart rate sensor correctly throughout the sleep session.
● The microphone is positioned to capture breathing sounds while minimizing environmental noise.
● The Velostat pressure matrix is properly embedded beneath the pillow surface.
● The temperature sensor maintains contact with the pillow surface throughout the experiment.
● Wi-Fi connectivity is available for cloud synchronization.
● The participant follows the prescribed experimental procedure during both baseline and
experimental sessions.
● The collected data are intended for comparative research and not for medical diagnosis.
APPENDIX F – System Constraints
The proposed prototype has the following limitations:
● The system does not diagnose sleep disorders.
● Sleep stages are not estimated.
● Snoring classification is not performed.
● Voice conversations are not recorded or stored.
● The prototype is intended only for comparative research.
● Sensor accuracy depends on proper placement.
● Environmental noise may influence breathing intensity measurements.
● Temperature measurements may vary with room conditions.
● The wearable heart rate sensor is an external device and is not embedded within the pillow.
APPENDIX G – Data Parameters
Parameter Unit Source
Heart Rate BPM Wearable Sensor
Breathing Intensity dB Microphone
Pressure Value ADC Units Velostat Matrix
Head Movement Count Count Pressure Analysis
Pillow Temperature °C Temperature Sensor
Timestamp Date & Time ESP32
Session ID Integer/String Database
User ID String Database
Estimated Cost
Component Maximum
Cost (₹)
ESP32 Development Board 700
MAX30102 Heart Rate Sensor 600
Microphone Module 500
Velostat Sheet 1000
Copper Tape 400
Temperature Sensor (DS18B20/LM35) 600
Jumper Wires & Breadboard 600
Miscellaneous Components 1500
Total Maximum Estimated Cost ₹6000
APPENDIX H – Experimental Procedure
The experimental evaluation shall be conducted in two phases.
Phase 1 – Baseline Study
The participant sleeps using a conventional pillow for multiple nights. Sensor readings and questionnaire
responses are collected after each session.
Phase 2 – Organic Pillow Study
The participant sleeps using the proposed organic pillow under similar environmental conditions.
Identical sensor observations are recorded.
Phase 3 – Comparative Analysis
The collected datasets are compared using graphical visualization and statistical measures to evaluate
differences in:
● Heart rate trends
● Breathing intensity
● Pressure distribution
● Head movement frequency
● Pillow surface temperature
● User comfort feedback
APPENDIX I – Dashboard Outputs
The dashboard shall generate the following visualizations:
● Heart Rate Trend Graph
● Breathing Intensity Graph
● Pressure Distribution Heat Map
● Head Movement Timeline
● Temperature Trend Graph
● Session Summary Report
● Comparative Before-and-After Analysis
● Exportable CSV Reports
APPENDIX J – References
1. IEEE Std 29148™-2018, Systems and Software Engineering—Life Cycle
Processes—Requirements Engineering.
2. IEEE Std 830-1998, Recommended Practice for Software Requirements Specifications (historical
reference).
3. Espressif Systems. ESP32 Series Datasheet.
4. Firebase Documentation. Realtime Database and Cloud Firestore.
5. Arduino Documentation. ESP32 Development Framework.
6. Chart.js Documentation. Interactive JavaScript Charts.
7. Relevant peer-reviewed journal articles on smart pillows, IoT-based sleep monitoring, wearable
heart-rate sensing, and pressure-based sleep analysis used in the literature review.
Time duration
Task Duration Timeline
Literature Survey & Requirement Analysis 1 Week Week 1
Hardware Procurement & Organic Pillow Preparation 1 Week Week 2
Hardware Development & Sensor Integration 2 Weeks Weeks 3–4
System Testing & Calibration 1 Week Week 5
Baseline Data Collection (Conventional Pillow) 15 Days Weeks 6–7
Experimental Data Collection (Organic Pillow) 15 Days Weeks 8–9
Data Analysis & Comparative Evaluation 1 Week Week 10
Documentation & Final Report 1 Week Week 11= 3
Months