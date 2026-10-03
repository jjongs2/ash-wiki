---
title: 차분 업데이트
tags:
  - security/ota
aliases:
  - Differential update
verified: 2026-10-03
---

**차분 업데이트**는 새 이미지 전체 대신 기기에 있는 이전 이미지와 새 이미지의 차이(패치)를 보내고, 기기가 이전 이미지에 패치를 적용해 새 이미지를 만드는 업데이트 방식이다.[@google-android-ota-tools-2026][@silabs-ug489-2025] 보내는 데이터의 양이 줄어든다.[@google-android-ota-tools-2026][@nordic-nrfxlib-delta-dfu-2026]

## 차분 생성과 적용

- 업데이트를 만드는 쪽은 이전 이미지와 새 이미지를 비교해 패치를 만든다.[@google-android-ota-tools-2026][@silabs-ug489-2025]
- 기기는 가진 이전 이미지를 읽어 패치를 적용하고, 그 결과를 새 이미지로 쓴다.[@silabs-ug489-2025][@google-android-ota-ab-2026]

## 원본 일치와 해시 확인

패치를 적용하려면 기기의 이전 이미지가 패치를 만들 때 쓴 이전 이미지와 같아야 한다.[@google-android-ota-tools-2026][@silabs-ug489-2025]

![[diagrams/delta-update-generate-apply.svg]]

- Android의 incremental 패키지는 고칠 파일의 이전 상태를 모두 확인한 뒤에 손을 대므로, 다른 빌드에 설치하면 실패하고 기기는 이전 상태로 남는다.[@google-android-ota-tools-2026]
- Android non-A/B 업데이트 스크립트의 `apply_patch`는 원본 파일의 SHA-1(Secure Hash Algorithm 1) [[cryptographic-hash-function|해시]]가 패치에 짝지어 둔 값과 같을 때만 패치를 적용한다. 결과 파일은 기대한 해시와 크기를 갖거나, 손대지 않은 채로 남는다.[@google-android-ota-inside-packages-2026]
- Android [[ab-update|A/B 업데이트]]는 연산을 모두 적용한 뒤 파티션 전체를 다시 읽어 기대한 해시와 대조한다.[@google-android-ota-ab-2026]

Arm Platform Security Boot Guide 1.1은 차분 업데이트에서 이미지 매니페스트에 패치를 적용한 뒤 나올 최종 이미지의 해시를 담게 한다.[@arm-den0072-2020]

## 패치 크기와 압축된 데이터

Android 문서에 따르면 incremental 패키지가 작은 까닭은 바뀌지 않은 파일을 넣지 않아도 되고, 바뀐 파일도 이전 판과 비슷한 경우가 많아 차이만 담으면 되기 때문이다.[@google-android-ota-tools-2026]

Android imgdiff 소스의 설명에 따르면 gzip으로 압축한 데이터는 원래 데이터가 조금만 바뀌어도 압축 비트스트림이 크게 바뀌어, 그대로 bsdiff로 만든 패치가 데이터 자체만큼 커지기 쉽다. imgdiff는 boot.img나 recovery.img처럼 gzip 구간이 섞인 이미지를 위한 차분 도구로, 이미지를 일반 청크와 gzip 청크로 나눠 일반 청크는 그대로, gzip 청크는 풀어서 bsdiff로 비교한다. 패치를 적용할 때는 패치한 데이터를 같은 인코더 파라미터로 다시 압축한다.[@google-aosp-imgdiff-2026]

## 알고리즘 예: bsdiff

Colin Percival은 2003년 논문에서 실행 파일의 바이너리 패치를 만드는 bsdiff를 제안했다.[@percival-naive-differences-2003][@percival-bsdiff-2026]

소스 코드를 조금 고쳐도 코드 덩어리의 상대 위치가 바뀌어, 그 구간을 건너뛰는 상대 분기의 거리와 뒤쪽 데이터를 가리키는 포인터가 파일 곳곳에서 바뀐다. 그래도 수정이 닿지 않은 구간에서는 바이트가 다른 곳이 드물고, 코드와 데이터가 덩어리째 옮겨져 가까운 주소들이 같은 양만큼 바뀐다. bsdiff는 이 관찰을 바탕으로 이전 파일을 해싱이나 접미사 정렬로 색인해, 새 파일에서 이전 파일과 정확히 일치하는 구간을 찾고 이를 앞뒤로 늘려 서로 겹치지 않는 대략 일치 구간을 만든다. 패치는 명령을 담은 제어 파일, 대략 일치 구간의 바이트 차이를 담은 차이 파일, 일치 구간 밖의 바이트를 담은 extra 파일로 이루어진다. 위 관찰대로라면 바이트 차이는 대부분 0이어서, 제어 파일과 차이 파일이 잘 압축된다.[@percival-naive-differences-2003]

![[diagrams/bsdiff-patch-structure.svg]]

bsdiff 도구는 색인에 접미사 정렬 알고리즘인 Larsson과 Sadakane의 qsufsort를 쓴다.[@percival-bsdiff-2026]

## 구현 예

- Android는 `ota_from_target_files`에 이전 빌드와 새 빌드의 target files를 주어 incremental OTA 패키지를 만든다.[@google-android-ota-tools-2026]
- Android의 OTA 생성 도구(releasetools)는 파일 확장자가 `.gz`, `.zip`, `.jar`, `.apk`, `.img`면 imgdiff를, 그 밖이면 bsdiff를 기본 차분 도구로 쓴다.[@google-aosp-releasetools-common-2026] android14-release 브랜치의 non-A/B incremental OTA는 zlib이 버전마다 같은 출력을 낸다고 보장할 수 없어, 파티션 차분에서 imgdiff를 끄고 bsdiff를 쓴다.[@google-aosp-releasetools-non-ab-ota-2026]
- Silicon Labs의 Gecko Bootloader는 슬롯에 있는 현재 펌웨어에 패치를 적용해 새 펌웨어를 만들고, 바르게 만들어지면 애플리케이션 영역으로 복사한다.[@silabs-ug489-2025]
