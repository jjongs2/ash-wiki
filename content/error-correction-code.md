---
title: ECC
tags:
  - network
aliases:
  - 오류 정정 부호
verified: 2026-09-29
---

**ECC**(Error Correction Code)는 오류 검출 부호 가운데, 찾아낸 오류의 일부를 자동으로 고칠 수 있게 하는 부호다.[@iec-60050-702-05-20-2016] 정보를 나타내는 데 꼭 필요한 것보다 많은 요소를 쓰는 중복 부호의 하나다.[@iec-60050-702-05-18-2016] ITU-T X.141(11/88)은 재전송을 요청하는 대신 받은 데이터의 오류를 찾아 고치는 방식을 FEC(Forward Error Correction), 곧 순방향 오류 정정이라 한다.[@itu-t-x-141-1988]

CCSDS 131.0-B-6(CCSDS: 각국 우주 기관의 데이터 시스템 표준화 위원회)은 $(n, k)$ 블록 부호의 **부호어**(codeword)를 정보 심볼 $k$개를 부호화해 만든 부호 심볼 $n$개의 열로 정의한다.[@ccsds-131-0-b-6-2026]

## 해밍 부호

**해밍 부호**는 [[parity-bit|패리티 비트]] 여러 개를 데이터 비트의 서로 다른 조합에 걸어, 비트 하나의 오류를 고치는 부호다. 해밍 (7,4) 부호는 데이터 4비트에 패리티 3비트를 더해 7비트 부호어를 만든다.[@xilinx-xapp645-2006][@macronix-an0271-2014]

패리티 비트는 부호어의 1, 2, 4번 자리에 두고, 각 패리티 비트는 자리 번호를 이진수로 썼을 때 자기 비트가 1인 자리들을 검사한다. 수신 측이 패리티를 다시 계산해 맞지 않는 것을 모으면 그 이진수가 틀린 비트의 자리 번호가 되고, 이것을 **신드롬**(syndrome)이라 한다.[@xilinx-xapp645-2006][@macronix-an0271-2014] 해밍 부호의 [[hamming-distance|최소 해밍 거리]]는 3이다.[@nxp-an13566-2022][@microchip-coreedac-2025]

![[diagrams/hamming-7-4-parity-venn.svg]]

정보 비트 $k$개에 검사 비트 $r$개를 더한 단일 오류 정정 부호에서, 검사 결과를 이진수로 읽은 값이 오류가 없음과 $k + r$개 자리 가운데 틀린 자리를 모두 가리키려면 아래 조건을 만족해야 한다.[@hamming-error-detecting-1950]

$$
2^r \ge k + r + 1
$$

부호어 길이를 $n = k + r$로 쓰면 이 조건은 아래 식이 된다.[@hamming-error-detecting-1950]

$$
2^k \le \frac{2^n}{n + 1}
$$

정정 능력을 넘는 오류는 잘못 고쳐질 수 있다.[@xilinx-xapp645-2006][@ti-spna139-2011] Xilinx XAPP645에 따르면 해밍 부호에서 비트 두 개가 뒤집히면 틀린 자리를 가리키거나 자리를 찾지 못한다.[@xilinx-xapp645-2006]

## SECDED

해밍 부호에 패리티 비트를 하나 더하면, 비트 하나의 오류를 고치고 비트 두 개의 오류를 찾아내는 **SECDED**(Single Error Correction, Double Error Detection) 부호가 되고 최소 해밍 거리가 4로 는다.[@nxp-an13566-2022][@microchip-coreedac-2025] 더하는 패리티 비트는 해밍 부호의 데이터 비트와 패리티 비트를 모두 짝수 패리티로 검사한다.[@hamming-error-detecting-1950]

Microchip CoreEDAC 사용자 가이드에 따르면 고치는 오류가 많을수록 중복 비트가 더 필요하고, 부호기와 복호기가 복잡해져 지연이 늘어난다.[@microchip-coreedac-2025]

## 메모리의 ECC

메모리에 저장된 비트는 알파 입자나 중성자 같은 방사선 때문에 뒤집힐 수 있다.[@nxp-an12522-2019][@ti-spraco4a-2021]

TI TMS570LS0914는 플래시와 RAM에 ECC를 두어, 단일 비트 오류를 고치고 다중 비트 오류는 알리기만 한다.[@ti-tms570ls0914-2016] NXP S32K1xx는 플래시와 SRAM에 ECC를 두어 단일 비트 오류를 고치고, 고칠 수 없는 오류는 알린다. S32K11x의 SRAM_L에는 ECC가 없다.[@nxp-an12522-2019]

TI Hercules MCU는 SRAM과 플래시의 ECC를 실행 중의 하드웨어 [[safety-mechanism|안전 메커니즘]]으로 쓴다.[@ti-spry178-2011] NXP 앱노트 AN13566에 따르면 ECC 메모리는 [[iso-26262|ISO 26262]] 같은 [[functional-safety|기능 안전]] 준수가 필요한 시스템에 알맞다.[@nxp-an13566-2022]

## Reed-Solomon 부호

CCSDS 131.0-B-6은 [[cyclic-redundancy-check#쓰는 곳|버스트 오류]]를 고치는 Reed-Solomon 부호를 정한다. 이 부호의 심볼은 8비트이고, 원소가 $2^8$개인 갈루아 체(Galois Field) $\mathrm{GF}(2^8)$의 원소 하나를 나타낸다. 부호어 하나는 심볼 $n = 255$개로 되고, 그 가운데 $2E$개가 패리티 심볼, $k = n - 2E$개가 정보 심볼이다. $E$는 부호어 하나에서 고칠 수 있는 심볼 오류의 수이고, 16이나 8로 둔다. 이 표준은 주석에서 $E = 16$이면 (255,223) 부호, $E = 8$이면 (255,239) 부호가 된다고 제시한다.[@ccsds-131-0-b-6-2026] [[ieee-802-3|IEEE 802.3]]-2022는 [[1000base-t1|1000BASE-T1]]도 전송 데이터를 Reed-Solomon 부호로 부호화하도록 정한다.[@ieee-802-3-2022]

![[diagrams/ccsds-reed-solomon-codeword.svg]]

## 길쌈 부호와 연접

CCSDS 131.0-B-6은 길쌈 부호와 연접의 용어를 이 문서 안에서 쓰는 뜻으로 아래처럼 정의한다.[@ccsds-131-0-b-6-2026]

- **길쌈 부호**(convolutional code): 입력 정보 비트 하나마다 출력 심볼을 여럿 내는 부호. 출력 심볼은 저마다 현재 입력 비트와 그 앞 $K - 1$개 비트의 일부나 전부를 선형 결합한 것이다. $K$는 아래의 구속장이다
- **구속장**(constraint length): 어느 때든 출력 심볼의 값을 정하는 데 필요한 연속 입력 비트의 수
- **부호율**(code rate): 부호기 출력의 비트 수에 대한 입력의 비트 수의 평균 비
- **연접**(concatenation): 두 부호 이상으로 데이터를 차례로 처리해 한 부호기의 출력을 다음 부호기의 입력으로 쓰는 것. 연접에서 처음 적용하는 부호가 **외부 부호**(outer code), 마지막에 적용하는 부호가 **내부 부호**(inner code)다[@ccsds-131-0-b-6-2026]

![[diagrams/convolutional-code-constraint-length.svg]]

이 표준의 기본 길쌈 부호는 부호율 1/2, 구속장 7이다. Reed-Solomon 부호만으로 부호 이득이 모자라면 Reed-Solomon 부호를 외부 부호, 길쌈 부호를 내부 부호로 연접할 수 있다.[@ccsds-131-0-b-6-2026]

![[diagrams/concatenated-code-outer-inner.svg]]

## ARQ와의 차이

오류 검출 부호를 붙여 보내고 받는 쪽이 요청하면 다시 보내는 [[automatic-repeat-request|ARQ]]와 달리, ECC는 되돌려 보낼 통로 없이 오류를 고친다.[@iec-60050-702-05-20-2016][@itu-t-x-141-1988] Xilinx XAPP645에 따르면 위성 수신기 같은 통신 응용에서는 데이터를 다시 보내기보다 오류를 고치는 편이 성능과 비용에서 효율적이다.[@xilinx-xapp645-2006]

RFC 3366에 따르면 링크 ARQ에서는 프레임을 다시 보낼 때마다 채널 접근, 전송, 전파, 프레임 처리 같은 단계가 되풀이되어 패킷의 지연이 늘어난다. FEC와 인터리빙은 프레임 처리에 상당한 지연을 더하고, 지터를 더하기도 한다.[@ietf-rfc-3366-2002]
