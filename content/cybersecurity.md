---
title: 사이버보안
tags:
  - security/cybersecurity
verified: 2026-10-03
---

[[iso-sae-21434|ISO/SAE 21434]]:2021은 도로 차량의 **사이버보안**(cybersecurity)을, 도로 차량의 [[cybersecurity-lifecycle#아이템과 운용 환경|아이템]]과 그 기능, 그 전기·전자 컴포넌트에 대한 위협 시나리오로부터 자산이 충분히 보호된 상태로 정의한다.[@iso-sae-21434-obp-2021] [[un-r155|UN R155]]는 사이버보안을 도로 차량과 그 기능이 전기·전자 컴포넌트에 대한 사이버 위협으로부터 보호된 상태로 정의한다.[@unece-r155-2021]

## 연결과 공격면

미국 도로교통안전국 NHTSA의 2022년 모범 사례에 따르면, 소비자는 제조사가 차량에 둔 셀룰러 데이터, Wi-Fi, Bluetooth, USB, OBD-II(On-Board Diagnostics II) 포트 같은 인터페이스로 애프터마켓 기기와 개인 장비를 차량 시스템에 잇는다. 차량 시스템으로 들어오는 무선 인터페이스는 원격으로 악용될 수 있는 새 공격 경로를 만든다. 이 지침은 **공격면**(attack surface)을, 허가받지 않은 사용자가 시스템에 데이터를 넣거나 빼내거나 시스템 동작을 바꾸려 할 수 있는 인터페이스의 집합으로 정의한다.[@nhtsa-cybersecurity-best-practices-2022]

UN R155는 부속서 5 Part A에서 차량의 외부 연결에 관한 위협의 예로, 원격 키, 이모빌라이저, 충전기(charging pile)처럼 시스템을 원격으로 조작하도록 만든 기능의 조작을 든다.[@unece-r155-2021]

## 공개된 사례

Charlie Miller와 Chris Valasek는 2015년 8월 논문에서, 개조하지 않은 2014년형 Jeep Cherokee를 원격으로 공격한 과정을 보였다. 두 사람은 셀룰러망으로 헤드 유닛 Uconnect의 서비스에 접근해 코드를 실행한 뒤, [[can|CAN]] 버스에 이어진 헤드 유닛의 Renesas V850 칩에 고친 펌웨어를 올려 이 칩으로 CAN 메시지를 보냈다. 이 원격 공격으로 조향과 제동 같은 일부 물리 시스템에 영향을 줄 수 있었다.[@miller-remote-exploitation-2015]

![[diagrams/jeep-cherokee-remote-attack-path.svg]]

Chrysler는 2015년 7월 23일 NHTSA에 리콜 15V-461을 신고했다. 사유는 RA3·RA4 라디오의 소프트웨어 [[vulnerability-management|취약점]]으로 제3자가 일부 차량 제어 시스템에 무단으로 접근할 수 있다는 것이었고, 대상은 2013\~2015년형 Ram, Jeep, Dodge, Chrysler 일부 차종 약 140만 대였다.[@chrysler-15v461-2015] EU 사이버보안 기관 ENISA의 보고서에 따르면 이 리콜은 Miller와 Valasek의 원격 공격 시연에서 비롯했다.[@enisa-smart-cars-2016]

Edward Markey 미국 상원의원실은 2015년 2월 보고서 "Tracking & Hacking"에서 16개 제조사의 답변을 분석했다. 보고서는 시판 차량의 거의 100%가 해킹이나 개인정보 침해에 취약할 수 있는 무선 기술을 갖췄고, 차량 전자 장치에 대한 원격 접근을 막는 보안 조치가 제조사마다 일관되지 않다고 지적했다.[@markey-tracking-hacking-2015]

## 규제, 표준, 지침

차량 사이버보안의 주요 규제, 표준, 지침과 정보 공유 조직은 다음과 같다.

| 이름                                                                       | 종류               | 내용                                                                                                                                                                                                                                 |
| -------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [[un-r155\|UN R155]]                                                       | 규정               | 사이버보안에 관한 차량 형식 승인과 제조사의 [[cybersecurity-management-system\|CSMS]]에 요구사항을 둔다.[@unece-r155-2021]                                                                                                           |
| ISO/SAE 21434                                                              | 표준               | 도로 차량 전기·전자 시스템의 개념부터 폐기까지 사이버보안 리스크 관리의 엔지니어링 요구사항을 정한다.[@iso-sae-21434-obp-2021]                                                                                                       |
| [[sae-j3061\|SAE J3061]]                                                   | 지침               | 2016년 1월 Recommended Practice로 나온 SAE International의 차량 사이버보안 지침이다.[@sae-j3061-2021]                                                                                                                                |
| [[automotive-spice-for-cybersecurity\|Automotive SPICE for Cybersecurity]] | 프로세스 평가 모델 | VDA QMC가 펴내는, [[automotive-spice\|ASPICE]] 4.0을 보완하는 사이버보안 엔지니어링의 프로세스 참조 모델과 프로세스 평가 모델이다.[@vda-automotive-spice-cybersecurity-2025]                                                         |
| Cybersecurity Best Practices for the Safety of Modern Vehicles             | 지침               | NHTSA가 자동차 업계에 내는 구속력 없는 자발적 지침이다. 2016년 10월 판의 권고를 2022년 9월 연구 결과, 업계 표준, 실제 사고 등을 바탕으로 고쳤다.[@nhtsa-cybersecurity-best-practices-2022][@nhtsa-cybersecurity-best-practices-2016] |
| Cyber Security and Resilience of Smart Cars                                | 보고서             | ENISA가 2016년 12월 낸 보고서다. 스마트 카의 민감한 자산, 그에 대한 위협과 리스크, 완화 요인, 보안 대책을 정리했다.[@enisa-smart-cars-2016]                                                                                          |
| Auto-ISAC                                                                  | 정보 공유 조직     | 자동차 제조사들이 2015년 8월 세운 정보 공유·분석 센터다. 커넥티드 차량의 사이버 위협, 취약점, 사고 정보를 모아 분석하고 회원과 나눈다.[@auto-isac-faq-2026]                                                                          |

## 차량 사이버보안이 노리는 것

NHTSA의 2022년 모범 사례는 업계가 NIST 사이버보안 프레임워크의 식별, 보호, 탐지, 대응, 복구를 따라 겹겹의 보호를 갖추기를 권한다. 이 접근에는 안전에 중요한 차량 제어 시스템을 리스크 기반으로 우선순위를 정해 보호하는 일, 현장의 사이버보안 사고를 제때 탐지하고 빠르게 대응하는 일, 사고에서 빨리 복구할 수 있게 설계하는 일이 든다. 이 지침은 공급망 안의 조직이 공급자에게 사이버보안 기대 사항을 분명히 정해 전하고, 업계가 Auto-ISAC 참여 같은 정보 공유로 취약점의 교훈을 빨리 받아들이기를 권한다.[@nhtsa-cybersecurity-best-practices-2022]

## 기능 안전과의 관계

차량의 사이버보안 취약점이나 공격은 안전에 영향을 줄 수 있다.[@nhtsa-cybersecurity-best-practices-2022][@enisa-smart-cars-2016] 사이버보안 표준과 [[functional-safety|기능 안전]] 표준의 관계는 [[iso-sae-21434#ISO 26262와의 관계|ISO/SAE 21434와 ISO 26262의 관계]]에서 다룬다.
