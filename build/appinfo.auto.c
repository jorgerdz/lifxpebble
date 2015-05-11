#include "pebble_process_info.h"
#include "src/resource_ids.auto.h"

const PebbleProcessInfo __pbl_app_info __attribute__ ((section (".pbl_header"))) = {
  .header = "PBLAPP",
  .struct_version = { PROCESS_INFO_CURRENT_STRUCT_VERSION_MAJOR, PROCESS_INFO_CURRENT_STRUCT_VERSION_MINOR },
  .sdk_version = { PROCESS_INFO_CURRENT_SDK_VERSION_MAJOR, PROCESS_INFO_CURRENT_SDK_VERSION_MINOR },
  .process_version = { 0, 2 },
  .load_size = 0xb6b6,
  .offset = 0xb6b6b6b6,
  .crc = 0xb6b6b6b6,
  .name = "LIFxPebble",
  .company = "jorgerdz",
  .icon_resource_id = RESOURCE_ID_IMAGE_MENU_ICON,
  .sym_table_addr = 0xA7A7A7A7,
  .flags = 0,
  .num_reloc_entries = 0xdeadcafe,
  .uuid = { 0x13, 0x32, 0x15, 0xF0, 0xCF, 0x20, 0x4C, 0x05, 0x99, 0x7B, 0x3C, 0x9B, 0xE5, 0xA5, 0x4D, 0x4B },
  .virtual_size = 0xb6b6
};
