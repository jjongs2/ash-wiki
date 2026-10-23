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
- Android 5.0 이상의 블록 기반 업데이트는 파일마다 비교하지 않고 파티션 전체를 파일 하나로 보아 바이너리 패치 하나를 만들어, 업데이트한 파티션이 의도한 비트와 똑같아지게 한다. 파일 기반 업데이트는 파일을 쓰는 순서나 블록 위치가 일정하다는 보장이 없어, dm-verity를 켠 기기에서는 업데이트 뒤 부팅하지 못한다.[@google-android-ota-block-2026]
- [[ab-update|A/B 업데이트]]가 실패하면 다시 시도할지와 언제 할지는 업데이트 클라이언트가 오류 코드를 보고 정하고, 예를 들어 diff 패키지가 실패하면 전체 패키지로 다시 시도할 수 있다.[@google-android-ota-ab-2026]

## 원본 일치와 해시 확인

패치를 적용하려면 기기의 이전 이미지가 패치를 만들 때 쓴 이전 이미지와 같아야 한다.[@google-android-ota-tools-2026][@silabs-ug489-2025]

![[diagrams/delta-update-generate-apply.svg]]

- Android의 incremental 패키지는 고칠 파일의 이전 상태를 모두 확인한 뒤에 손을 대므로, 다른 빌드에 설치하면 실패하고 기기는 이전 상태로 남는다.[@google-android-ota-tools-2026]
- Android non-A/B 업데이트 스크립트의 `apply_patch`는 원본 파일의 SHA-1(Secure Hash Algorithm 1) [[cryptographic-hash-function|해시]]가 패치에 짝지어 둔 값과 같을 때만 패치를 적용한다. 결과 파일은 기대한 해시와 크기를 갖거나, 손대지 않은 채로 남는다.[@google-android-ota-inside-packages-2026]
- Android A/B 업데이트는 연산을 모두 적용한 뒤 파티션 전체를 다시 읽어 기대한 해시와 대조한다.[@google-android-ota-ab-2026]

패치의 원본이 될 파티션은 시스템이 고치지 않아야 한다.[@google-android-ota-ab-implement-2026][@mender-server-side-delta-2026]

Arm Platform Security Boot Guide 1.1은 차분 업데이트에서 이미지 매니페스트에 패치를 적용한 뒤 나올 최종 이미지의 해시를 담게 한다.[@arm-den0072-2020]

RFC 9124에 따르면 매니페스트 정보 모델은 차분 업데이트처럼 기기에 특정 페이로드가 있어야 적용되는 업데이트를 위해, 그 선행 이미지의 다이제스트를 조건으로 다는 요소(precursor image digest condition)를 선택 요소로 둔다.[@ietf-rfc-9124-2022]

[[autosar|AUTOSAR]] R25-11 [[autosar-update-and-configuration-management|Update and Configuration Management]] 명세는 delta [[autosar-update-and-configuration-management#패키지|Software Package]]에 그 패키지를 적용할 [[autosar-software-cluster#Adaptive Platform의 Software Cluster와의 차이|Software Cluster]]의 버전(`deltaPackageApplicableVersion`)을 담게 하고, 그 버전이 설치된 Software Cluster의 버전과 다르면 패키지 처리를 kDeltaIncompatible 오류로 거부하게 한다.[@autosar-ap-sws-updateandconfigurationmanagement-2025]

## 패치 크기와 압축된 데이터

Android 문서에 따르면 incremental 패키지가 작은 까닭은 바뀌지 않은 파일을 넣지 않아도 되고, 바뀐 파일도 이전 판과 비슷한 경우가 많아 차이만 담으면 되기 때문이다.[@google-android-ota-tools-2026]

Android imgdiff 소스의 설명에 따르면 gzip으로 압축한 데이터는 원래 데이터가 조금만 바뀌어도 압축 비트스트림이 크게 바뀌어, 그대로 bsdiff로 만든 패치가 데이터 자체만큼 커지기 쉽다. imgdiff는 `boot.img`나 `recovery.img`처럼 gzip 구간이 섞인 이미지를 위한 차분 도구로, 이미지를 일반 청크와 gzip 청크로 나눠 일반 청크는 그대로, gzip 청크는 풀어서 bsdiff로 비교한다. 패치를 적용할 때는 패치한 데이터를 같은 인코더 파라미터로 다시 압축한다.[@google-aosp-imgdiff-2026]

Android는 A/B 업데이트 패키지를 만들 때 deflate 스트림을 위한 결정적 패치 도구 Puffin으로 재압축과 차분을 처리한다. Android 9 이상에서 bsdiff 도구는 패치마다 가장 잘 압축되는 압축 알고리즘을 고른다.[@google-android-ota-reduce-size-2026]

[[uptane|Uptane]] Standard 2.1.0은 사용 사례의 하나로, OEM이 [[uptane#두 저장소|Director]] repository의 사용자 정의 Targets 메타데이터에 delta 이미지를 적용하는 알고리즘과 delta 이미지의 Targets 메타데이터를 더해 ECU 하나를 delta 이미지로 업데이트하는 경우를 든다.[@uptane-standard-2-1-0-2023] Uptane Deployment Best Practices 2.1.0은 delta 이미지를 설치할 때 ECU마다 계산하는 dynamic delta update와, 있을 법한 delta 이미지를 미리 계산해 두는 precomputed delta update를 나눈다. 미리 계산한 delta 이미지는 Image repository에 둘 수 있어, Director repository가 침해되었을 때의 보안을 더한다.[@uptane-deployment-best-practices-2-1-0-2023]

## 블록 해시 색인으로 받는 양 줄이기

패키지에 이미지의 블록이나 청크마다 해시를 담은 색인을 넣어 두면, 기기는 이미 가진 데이터에서 해시가 같은 블록을 찾아 쓰고 나머지만 HTTP Range 요청으로 받을 수 있다.[@rauc-advanced-topics-2026][@swupdate-delta-update-2026]

RAUC는 이 방식을, 특정 이전 판에서 새 판으로 가는 데 필요한 데이터를 담는 delta update와 구별해 **adaptive update**라 부른다. adaptive update는 특정 이전 판 위에만 설치되지 않고, 이전 판이나 중단된 설치 시도에서 기기에 남은 데이터를 골라 쓴다. block-hash-index 방식은 4 KiB 블록마다 SHA-256 해시를 두어, 색인의 크기는 원래 이미지의 0.8%다.[@rauc-advanced-topics-2026]

![[diagrams/block-hash-index-download.svg]]

SWUpdate는 알려진 기준에서 하는 업데이트를 delta update라 부르고, 이를 zchunk 형식으로 구현한다. zchunk 파일의 헤더는 모든 청크의 메타데이터와 해시를 담아, 헤더를 보면 받아야 할 청크와 다시 쓸 수 있는 청크를 알 수 있다. SWUpdate는 이 헤더를 서명된 업데이트 패키지에 넣으므로, 패키지 밖의 주소에서 받는 청크도 이미 검증한 헤더의 해시로 확인할 수 있다.[@swupdate-delta-update-2026]

## 알고리즘 예: bsdiff

Colin Percival은 2003년 논문에서 실행 파일의 바이너리 패치를 만드는 bsdiff를 제안했다.[@percival-naive-differences-2003][@percival-bsdiff-2026]

소스 코드를 조금 고쳐도 코드 덩어리의 상대 위치가 바뀌어, 그 구간을 건너뛰는 상대 분기의 거리와 뒤쪽 데이터를 가리키는 포인터가 파일 곳곳에서 바뀐다. 그래도 수정이 닿지 않은 구간에서는 바이트가 다른 곳이 드물다. 또 코드와 데이터가 덩어리째 옮겨지므로 가까운 주소들은 같은 양만큼 바뀐다. bsdiff는 이 관찰을 바탕으로 이전 파일을 해싱이나 접미사 정렬로 색인해, 새 파일에서 이전 파일과 정확히 일치하는 구간을 찾고 이를 앞뒤로 늘려 서로 겹치지 않는 대략 일치 구간을 만든다. 패치는 명령을 담은 제어 파일, 대략 일치 구간의 바이트 차이를 담은 차이 파일, 대략 일치 구간 밖의 바이트를 담은 extra 파일로 이루어진다. 위 관찰대로라면 바이트 차이는 대부분 0이어서, 제어 파일과 차이 파일이 잘 압축된다.[@percival-naive-differences-2003]

![[diagrams/bsdiff-patch-structure.svg]]

bsdiff 도구는 색인에 접미사 정렬 알고리즘인 Larsson과 Sadakane의 qsufsort를 쓴다.[@percival-bsdiff-2026]

## 알고리즘 예: 실행 파일 구조를 아는 차분

Chromium 소스의 Zucchini 설명 문서에 따르면 바이너리 안의 참조를 나타내는 바이트는 참조 대상(과 위치)에 따라 정해져 새 판에서 바뀌기 쉽고, 그래서 단순한 패치는 바이너리에서 잘 듣지 않는다.[@google-chromium-zucchini-readme-2026]

Google은 2009년 7월 Chrome 업데이트를 작게 하려고 새 압축 알고리즘 Courgette를 쓰기 시작했다.[@google-chromium-courgette-2009]

Courgette는 간이 디스어셈블러로 컴파일된 코드 안의 내부 포인터를 찾고, 포인터가 가리키는 주소를 배열에 모아 포인터를 그 배열의 색인으로 바꾼다. 이 배열이 기호 표 구실을 하므로, 새 판 기호 표 안의 주소 순서를 옛 판과의 차분이 작아지게 다시 배열한 뒤, 이렇게 바꾼 두 판을 bsdiff로 차분한다. 개발자 채널의 190.1에서 190.4로 가는 업데이트에서 전체 업데이트는 10,385,920바이트, bsdiff 업데이트는 704,512바이트, Courgette 업데이트는 78,848바이트였다.[@google-chromium-courgette-design-2026]

![[diagrams/courgette-update-sizes.svg]]

## 구현 예

- Android는 `ota_from_target_files`에 이전 빌드와 새 빌드의 target files를 주어 incremental [[over-the-air-update|OTA]] 패키지를 만든다.[@google-android-ota-tools-2026]
- Android의 OTA 생성 도구(releasetools)는 파일 확장자가 `.gz`, `.zip`, `.jar`, `.apk`, `.img`면 imgdiff를, 그 밖이면 bsdiff를 기본 차분 도구로 쓴다.[@google-aosp-releasetools-common-2026] android14-release 브랜치의 non-A/B incremental OTA는 zlib이 버전마다 같은 출력을 낸다고 보장할 수 없어, 파티션 차분에서 imgdiff를 끄고 bsdiff를 쓴다.[@google-aosp-releasetools-non-ab-ota-2026]
- Silicon Labs의 Gecko Bootloader는 슬롯에 있는 현재 펌웨어에 패치를 적용해 새 펌웨어를 만들고, 바르게 만들어지면 애플리케이션 영역으로 복사한다.[@silabs-ug489-2025]
- Mender의 바이너리 delta는 xdelta 압축 도구로 만든다.[@mender-create-delta-artifact-2026] Mender 서버는 delta Artifact를 만들지 못하면 delta가 아닌 Artifact로 대신한다.[@mender-server-side-delta-2026]
