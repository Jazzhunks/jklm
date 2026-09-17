package com.northend.admin.utils

import java.text.NumberFormat
import java.util.*

object Formatters {
    fun fmtINR(amount: Double?): String {
        val num = amount ?: 0.0
        val format = NumberFormat.getCurrencyInstance(Locale("en", "IN"))
        return format.format(num)
    }
}
